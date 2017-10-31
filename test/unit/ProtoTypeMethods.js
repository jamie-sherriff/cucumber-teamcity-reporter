'use strict';
import test from 'ava';
import TeamCityReporter from '../../lib/reporter';

test('Check module exists', t => {
	t.is(typeof TeamCityReporter, 'function');
});

test('Check prototype functions exist', t => {
	t.truthy(TeamCityReporter.prototype.logStepStart);
	t.truthy(TeamCityReporter.prototype.logStepStart);
	t.truthy(TeamCityReporter.prototype.logStepFinished);
	t.truthy(TeamCityReporter.prototype.logSuiteStart);
	t.truthy(TeamCityReporter.prototype.logTeamCityEvent);
});

test('Check prototype property names', t => {
	const propertyNameList = Object.getOwnPropertyNames(TeamCityReporter.prototype);
	t.snapshot(propertyNameList);
});


test('Create new reporter', t => {
	const newReporter = new TeamCityReporter({eventBroadcaster: {on: function(){}}, cwd:process.cwd()});
	t.truthy(newReporter);
	t.truthy(newReporter.pathRegexp);
	t.truthy(newReporter.cwd);
});