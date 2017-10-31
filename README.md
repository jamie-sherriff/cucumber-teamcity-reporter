# cucumber-teamcity-reporter
Teamcity Reporter for cucumberjs


## Test translation from Gherkin to Teamcity
A test is structured as follows
~~~
<SuiteName>:<TestName>

SuiteName = <Feature File name>:<Feature Name>
TestName = <Scenario Name>:<Scenario Step>
~~~

## Known issues
* This does not use line numbers for test step names so tests can appear as duplicated on Teamcity (run x of x) beside the step

## Running
 `node_modules/.bin/cucumberjs test/data/features/example.feature -r test/data/features/step_definitions/example_steps.js`