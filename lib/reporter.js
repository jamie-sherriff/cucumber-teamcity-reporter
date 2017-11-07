'use strict';
const {Formatter} = require('cucumber');
const _ = require('lodash');
const processPID = process.pid.toString();
const TEST_IGNORED = `##teamcity[testIgnored name='%s' message='%s' flowId='${processPID}']`;
const SUITE_START = `##teamcity[testSuiteStarted name='%s' flowId='${processPID}']`;
const SUITE_END = `##teamcity[testSuiteFinished name='%s' flowId='${processPID}']`;
const TEST_START = `##teamcity[testStarted name='%s' captureStandardOutput='true' flowId='${processPID}']`;
const TEST_FAILED = `##teamcity[testFailed name='%s' message='%s' details='%s' captureStandardOutput='true' flowId='${processPID}']`;
const TEST_END = `##teamcity[testFinished name='%s' duration='%s' flowId='${processPID}']`;
const util = require('util');
const path = require('path');
const debug = require('debug')('cucumber-teamcity-reporter');


function escape(str) {
	if (!str) return '';
	return str
		.toString()
		.replace(/\x1B.*?m/g, '') // eslint-disable-line no-control-regex
		.replace(/\|/g, '||')
		.replace(/\n/g, '|n')
		.replace(/\r/g, '|r')
		.replace(/\[/g, '|[')
		.replace(/\]/g, '|]')
		.replace(/\u0085/g, '|x')
		.replace(/\u2028/g, '|l')
		.replace(/\u2029/g, '|p')
		.replace(/'/g, '|\'');
}

function formatString() {
	let formattedArguments = [];
	const args = Array.prototype.slice.call(arguments, 0);
	// Format all arguments for TC display (it escapes using the pipe char).
	let tcMessage = args.shift();
	args.forEach(function (param) {
		formattedArguments.push(escape(param));

	});
	formattedArguments.unshift(tcMessage);
	return util.format.apply(util, formattedArguments) + '\n';
}

function safeFunctionExec(func) {
	try {
		func();
	} catch (error) {
		debug(error);
	}
}

const EVENT_NAMES = [
	'source',
	'attachment',
	'gherkin-document',
	'pickle',
	'pickle-accepted',
	'pickle-rejected',
	'test-run-started',
	'test-case-prepared',
	'test-case-started',
	'test-step-started',
	'test-step-attachment',
	'test-step-finished',
	'test-case-finished',
	'test-run-finished'
];


/*Formatter instance inherits following attributes
 * colorFns
 * cwd
 * log
 * snippetBuilder
 * stream
 * supportCodeLibrary
 * */
class TeamCityReporter extends Formatter {
	constructor(options) {
		super(options);
		this.currentStepStart = null;
		EVENT_NAMES.forEach(eventName => {
			options.eventBroadcaster.on(eventName, data =>
				this.logTeamCityEvent(eventName, data)
			);
		});
		this.features = {};
		this.currentFeature = {};
		this.lastFeature = {};
		const pathSepRegexp = new RegExp(_.escapeRegExp(path.sep), 'g');
		const pathToRemove = this.cwd.replace(pathSepRegexp, path.posix.sep) + path.posix.sep;
		this.pathRegexp = new RegExp(_.escapeRegExp(pathToRemove), 'g');
	}

	logStepStart({testCase, index}) {
		this.currentStepStart = new Date().getTime();
		//Returns objects: testStep, pickleStep, gherkinKeyword
		const {pickleStep} = this.eventDataCollector.getTestStepData({testCase, index});
		//Returns objects: gherkinDocument, pickle, testCase
		const testData = this.eventDataCollector.getTestCaseData(testCase.sourceLocation);
		const pickle = testData.pickle;
		if (pickleStep) {
			const stepName = `${pickle.name}:${pickleStep.text}`;
			this.log(formatString(TEST_START, stepName));
		} else {
			this.log(`StepStartHook: ${pickle.name}:Line-${testCase.sourceLocation.line}\n`);
		}
	}

	logStepFinished({testCase, index, result}) {
		//Returns objects: testStep, pickleStep, gherkinKeyword
		const {pickleStep} = this.eventDataCollector.getTestStepData({testCase, index});
		//Returns objects: gherkinDocument, pickle, testCase
		const {pickle} = this.eventDataCollector.getTestCaseData(testCase.sourceLocation);
		if (pickleStep) {
			const stepName = `${pickle.name}:${pickleStep.text}`;
			const currentTime = new Date().getTime();
			let duration;
			if (!_.isNil(this.currentStepStart)) {
				duration = result.duration || currentTime - this.currentStepStart;
				this.currentStepStart = null;
			} else {
				duration = result.duration || 1;
			}
			const testStatus = result.status;
			if (testStatus === 'failed') {
				const exception = result.exception;
				exception.stack = exception.stack.replace(this.pathRegexp, '');
				this.log(formatString(TEST_FAILED, stepName, exception.name, exception.stack));
			} else if (testStatus === 'ambiguous') {
				this.log(formatString(TEST_FAILED, stepName, 'ambiguous test case', JSON.stringify(result) + '-' + JSON.stringify(pickleStep)));
			} else if (testStatus === 'skipped') {
				this.log(formatString(TEST_IGNORED, stepName, 'Test Skipped'));
			} else if (testStatus === 'pending') {
				this.log(formatString(TEST_IGNORED, stepName, 'Test pending'));
			}
			this.log(formatString(TEST_END, stepName, duration));
		} else {
			this.log(`StepFinishHook: ${pickle.name}:Line-${testCase.sourceLocation.line}\n`);
		}
	}

	logSuiteStartAndOrEnd(data) {
		const currentFeature = this.features[data.sourceLocation.uri];
		if (currentFeature.suiteName !== this.currentFeature.suiteName) {
			if(currentFeature.started === false && this.lastFeature.finished === false){
				this.features[this.lastFeature.uri].finished = true;
				this.log(formatString(SUITE_END, this.lastFeature.suiteName));
			}
			this.logSuiteStartName(currentFeature.suiteName);
		}
		this.lastFeature = _.cloneDeep(currentFeature);
		this.currentFeature = currentFeature;
		if (!currentFeature.started) {
			currentFeature.started = true;
		}
	}

	logSuiteStartName(suiteName) {
		this.log(formatString(SUITE_START, suiteName));
	}

	logTeamCityEvent(eventName, data) { // eslint-disable-line complexity
		switch (eventName) {
			case 'source':
			case 'attachment':
			case 'pickle-accepted': //don't need
			case 'pickle-rejected': //don't need
			case 'test-run-started':  //gherkin-document has more info
			case 'test-case-prepared': //don't need
			case 'test-step-attachment':  //don't need
			case 'pickle': //don't need
			case 'test-case-finished':
				break;
			case 'test-step-started':
				safeFunctionExec(() => {
					return this.logStepStart(data);
				});
				break;
			case 'test-case-started':
				safeFunctionExec(() => {
					this.logSuiteStartAndOrEnd(data);
				});
				break;
			case 'test-step-finished':
				safeFunctionExec(() => {
					this.logStepFinished(data);
				});
				break;
			case 'gherkin-document':
				safeFunctionExec(() => {
					const featureFileName = path.basename(data.uri, '.feature');
					const featureName = data.document.feature.name;
					const suiteName = `${featureFileName}:${featureName}`;
					this.features[data.uri] = {featureName, suiteName, started: false, finished: false, uri: data.uri};
				});
				break;
			case 'test-run-finished':
				safeFunctionExec(() => {
					if (this.lastFeature.finished === false) { //last feature case
						this.features[this.lastFeature.uri].finished = true;
						this.log(formatString(SUITE_END, this.lastFeature.suiteName));
					}
				});
				break;
			default:
				debug(`Invalid event name of ${eventName}`);
				break;
		}
	}
}
module.exports = TeamCityReporter;