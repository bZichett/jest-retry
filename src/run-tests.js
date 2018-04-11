/* eslint-disable no-console */


const path = require('path');
const jest = require('jest-cli');
const yargs = require('yargs');
const jestJunit = require('jest-junit');

const getOptions = require('./args')
const { newLineWrap: nW, multiLineParamToArray } = require('./string');
const retryFlakyTests = require('./retry-flaky-tests');
const passesWithoutKnownIssues = require('./known-issues')

function runTests(runConfig) {
  const rootDir = process.cwd();
  yargs.options(getOptions(runConfig));

  const argv = yargs.argv;

  process.env.JEST_JUNIT_OUTPUT = path.resolve(rootDir, argv.testResultsOutput);

  // Multi-line string parameter passed from job, mutates input arguments
  multiLineParamToArray(argv, 'flakyFailureMessages')
  multiLineParamToArray(argv, 'knownIssues')

  const flakyOptions = {
    flakyWaitBeforeRerun: argv.flakyWaitBeforeRerun,
    flakyNumRetries: argv.flakyNumRetries,
    flakyTestMock: argv.flakyTestMock,
    flakyMarkAll: argv.flakyMarkAll,
    flakyFailureMessages: argv.flakyTestMock
      ? ['Expected value to be']
      : argv.flakyFailureMessages,
    knownIssues: argv.knownIssues,
    outputTestResults: argv.outputTestResults
  };

  const testDirs = argv.flakyTestMock
    ? [path.resolve(rootDir, argv.flakyTestMockDir)]
    : [path.resolve(rootDir, argv.testDir)];

  const jestConfig = {
    _: argv.testFilter ? [argv.testFilter] : argv._,
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
    if (flakyOptions.outputTestResults) {
      jestJunit(response.results);
    }

    if (response.results.success || passesWithoutKnownIssues(argv.knownIssues, response.results)) {
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