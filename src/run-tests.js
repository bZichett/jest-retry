/* eslint-disable no-console */

const path = require('path');
const jest = require('jest-cli');
const yargs = require('yargs');
const jestJunit = require('jest-junit');

const getOptions = require('./args')
const { newLineWrap: nW, multiLineParamToArray } = require('./string');
const retryFlakyTests = require('./retry-flaky-tests');

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
    noStackTrace: argv.noStackTrace,
    silent: argv.silent,
    runInBand: argv.maxWorkers === 1,
    reporters: getReporter(argv.reporter),
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

    if (response.results.success) {
      return done(true);
    }

    if (argv.flakyNumRetries === 0) {
      return done(false);
    }

    retryFlakyTests({
      results: response.results,
      jestConfig,
      testDirs,
      flakyOptions,
      done: (result, message) => done(result, message)
    });
  });
}

function done(result, message) {
  console.log('\n')
  if (message) console.log('Message: ', message)
  console.log(`Test result: ${result ? 'Passed' : 'Failed'}`);
  if (result === true) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Fail
  }
}

function getReporter(reporter) {
  if (reporter !== 'false' && reporter !== 'default' && reporter === 'minimal') {
    return [path.join(__dirname, 'minimal-reporter.js')]
  }
  return false
}
module.exports = runTests