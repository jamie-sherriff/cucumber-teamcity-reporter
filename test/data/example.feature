#source
#gherkin-document
Feature: Check a cucumber test works
  This should be a description for a feature

    #test-run-started

  #pickle
  #test-case-prepared
 Scenario: Passing Scenario
   #test-case-started
   #test-step-started
   #index 0
   Given I should be able to pass a test 1
   #test-step-finished
    #test-step-started
    # index 1
   Given I should be able to pass a test 1
   #test-step-finished
    #test-step-started
    # index 2
   And I should be able to pass a test 2
   #test-step-finished
  #test-case-finished

   #pickle
    # test-case-prepared
  Scenario: Failing Scenario
    Given I should be able to fail a test 1
    And I should be able to fail a test 2

    #pickle
  Scenario: Mixed Scenario
    Given I should be able to fail a test
    And I should be able to pass a test

    #pickle
  Scenario: Mixed Scenario duplicate test names
    Given I should be able to pass a test 1
    And I should be able to fail a test 1

    #test-run-finished