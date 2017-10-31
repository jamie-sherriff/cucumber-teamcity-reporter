'use strict';
const {defineSupportCode} = require('cucumber');
const assert = require('assert');

defineSupportCode(function ({Given}) {
	Given(/I should be able to pass a test/, function () {
		assert(true, 'This test should pass');
	});

	Given(/I should be able to fail a test/, function () {
		assert(false, 'This test should fail');
	});

});
