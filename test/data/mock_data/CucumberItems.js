'use strict';
module.exports =
{
	pickles: [{
		tags: [],
		name: 'Passing Scenario',
		language: 'en',
		locations: [{line: 10, column: 2}],
		steps: [{
			text: 'I should be able to pass a test 1',
			arguments: [],
			locations: [{line: 14, column: 10}]
		},
			{
				text: 'I should be able to pass a test 1',
				arguments: [],
				locations: [{line: 18, column: 10}]
			},
			{
				text: 'I should be able to pass a test 2',
				arguments: [],
				locations: [{line: 22, column: 8}]
			}]
	},
		{
			tags: [],
			name: 'Failing Scenario',
			language: 'en',
			locations: [{line: 28, column: 3}],
			steps: [{
				text: 'I should be able to fail a test 1',
				arguments: [],
				locations: [{line: 29, column: 11}]
			},
				{
					text: 'I should be able to fail a test 2',
					arguments: [],
					locations: [{line: 30, column: 9}]
				}]
		},
		{
			tags: [],
			name: 'Mixed Scenario',
			language: 'en',
			locations: [{line: 33, column: 3}],
			steps: [{
				text: 'I should be able to fail a test',
				arguments: [],
				locations: [{line: 34, column: 11}]
			},
				{
					text: 'I should be able to pass a test',
					arguments: [],
					locations: [{line: 35, column: 9}]
				}]
		},
		{
			tags: [],
			name: 'Mixed Scenario duplicate test names',
			language: 'en',
			locations: [{line: 38, column: 3}],
			steps: [{
				text: 'I should be able to pass a test 1',
				arguments: [],
				locations: [{line: 39, column: 11}]
			},
				{
					text: 'I should be able to fail a test 1',
					arguments: [],
					locations: [{line: 40, column: 9}]
				}]
		}],

	testResult: { index: 1,
		result: { duration: 0, status: 'passed' },
		testCase: { sourceLocation: { uri: 'features/dev/example.feature', line: 28 } } }

};
