#!/usr/bin/env node

/* eslint-disable no-console */
const path = require('path');
const jest = require('jest-cli');
const getOptions = require('./args');
const yargs = require('yargs');
const jestJunit = require('jest-junit');

const retryFlakyTests = require('./retry-flaky-tests');
const rootDir = process.cwd();
const runConfig = require(path.resolve(rootDir, 'run-config.js'));

yargs.options(getOptions(runConfig));

const argv = yargs.argv;

process.env.JEST_JUNIT_OUTPUT = path.resolve(rootDir, argv.testResultsOutput);

// Multi-line string parameter passed from job
if (!Array.isArray(argv.flakyFailureMessages)) {
  argv.flakyFailureMessages = argv.flakyFailureMessages[0].split('\n');
}

const flakyOptions = {
  flakyWaitBeforeRerun: argv.flakyWaitBeforeRerun,
  flakyNumRetries: argv.flakyNumRetries,
  flakyTestMock: argv.flakyTestMock,
  flakyMarkAll: argv.flakyMarkAll,
  flakyFailureMessages: argv.flakyTestMock
    ? ['Expected value to be']
    : argv.flakyFailureMessages,
  outputTestResults: argv.outputTestResults
};

const testDirs = argv.flakyTestMock
  ? [path.resolve(rootDir, argv.flakyTestMockDir)]
  : [path.resolve(rootDir, argv.testDir)];

const jestConfig = {
  _: argv.testFilter && [argv.testFilter],
  roots: testDirs,
  maxWorkers: argv.maxWorkers,
  debug: argv.debug,
  runInBand: argv.maxWorkers === 1,
  setupTestFrameworkScriptFile: argv.setupTestFrameworkScriptFile &&
    path.resolve(
      rootDir,
      argv.setupTestFrameworkScriptFile
    ),
  testEnvironment: 'node'
};

console.log('jestConfig', jestConfig);
console.log('flakyOptions', flakyOptions);

jest.runCLI(jestConfig, testDirs).then(response => {
  if (response.results.success) {
    if (argv.outputTestResults) {
      jestJunit(response.results);
    }

    return process.exit(0);
  }

  if (argv.flakyNumRetries === 0) {
    return process.exit(1);
  }

  retryFlakyTests({
    results: response.results,
    jestConfig,
    testDirs,
    flakyOptions,
    done: result => {
      console.log(`\nTest retries result: ${result} \n`);
      if (result === true) {
        process.exit(0); // Success
      } else {
        process.exit(1); // Fail
      }
    }
  });
});
