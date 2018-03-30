/* eslint-disable no-console */
const path = require('path');
const jest = require('jest-cli');
const yargs = require('yargs');
const jestJunit = require('jest-junit');

const getOptions = require('./args')
const { newLineWrap: nW } = require('./string');
const retryFlakyTests = require('./retry-flaky-tests');

function runTests(runConfig) {
  const rootDir = process.cwd();
  yargs.options(getOptions(runConfig));

  const argv = yargs.argv;

  process.env.JEST_JUNIT_OUTPUT = path.resolve(rootDir, argv.testResultsOutput);

  // Multi-line string parameter passed from job
  if (argv.flakyFailureMessages &&
    argv.flakyFailureMessages[0] &&
    argv.flakyFailureMessages[0].includes('\n')) {
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
    _: argv._ || argv.testFilter,
    roots: testDirs,
    maxWorkers: argv.maxWorkers,
    debug: argv.debug,
    runInBand: argv.maxWorkers === 1,
    setupTestFrameworkScriptFile:
    argv.setupTestFrameworkScriptFile &&
    path.resolve(rootDir, argv.setupTestFrameworkScriptFile),
    testEnvironment: 'node'
  };

  if (argv.debug) {
    console.log('jestConfig', jestConfig);
    console.log('flakyOptions', flakyOptions);
  }

  jest.runCLI(jestConfig, testDirs).then(response => {
    if (response.results.success) {
      if (flakyOptions.outputTestResults) {
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
        console.log(nW(`Test retries result: ${result}`));
        if (result === true) {
          process.exit(0); // Success
        } else {
          process.exit(1); // Fail
        }
      }
    });
  });
}

module.exports = runTests