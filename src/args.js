function getOptions(runConfig) {
  return {
    debug: {
      default: false,
      type: 'boolean'
    },
    testDir: {
      default: runConfig.testDir || 'src/tests'
    },
    testFilter: {
      description: 'Narrow down the tests ran by regular expression'
    },
    testNamePattern: {
      description: 'Run only tests with a name that matches the regex'
    },
    outputTestResults: {
      default: true,
      description:
        'Whether to store persistent test result output (currently jest-junit only)'
    },
    testResultsOutput: {
      description: 'Where to store persistent test result output',
      default: runConfig.testResultsOutput || '.'
    },

    // Test retry options
    flakyNumRetries: {
      // if 0, no retries (disable functionality)
      // if Infinity, keep retrying until duplicate result
      default: runConfig.flakyNumRetries || 0,
      type: 'number',
      description:
        'Number of times to retry a flaky test before marking as failed'
    },
    flakyTestMock: {
      default: runConfig.flakyTestMock,
      description: 'Run a simple quick suite for testing retry patterns',
      type: 'boolean'
    },
    flakyTestMockDir: {
      default: 'test',
      description: 'Directory where mock tests are stored'
    },
    flakyFailureMessages: {
      default: runConfig.flakyFailureMessages,
      description:
        'newline separated strings which are regarded as flaky and marked to re-run',
      type: 'array'
    },
    knownIssues: {
      default: runConfig.knownIssues || [],
      description:
        'newline separated strings which are regarded as known issues and do not count towards failures',
      type: 'array'
    },
    excludeTags: {
      default: runConfig.excludeTags || [],
      description: 'comma separated list of suites to exclude',
      type: 'array'
    },
    tags: {
      default: runConfig.tags || [],
      description: 'comma separated list of suites to include (all others excluded)',
      type: 'array'
    },
    flakyMarkAll: {
      default: runConfig.flakyMarkAll,
      description:
        'Mark all failures as being flaky (ignore "flakyFailureMessages")',
      type: 'boolean'
    },
    flakyWaitBeforeRerun: {
      default: runConfig.flakyWaitBeforeRerun || 1000,
      description: 'How long to wait before executing retry',
      type: 'number'
    },

    // Jest options
    setupTestFrameworkScriptFile: {
      default: runConfig.setupTestFrameworkScriptFile,
      description:
        'The path to a module that runs some code to configure or ' +
        'set up the testing framework before each test.',
      type: 'string'
    },
    reporter: {
      default: runConfig.reporter || false,
      description:
      'The path to a module that runs some code to configure or ' +
      'set up the testing framework before each test.',
      type: 'string'
    },
    noStackTrace: {
      default: runConfig.noStackTrace || false,
      type: 'boolean',
    },
    silent: {
      default: runConfig.silent || false,
      type: 'boolean',
    },
    maxWorkers: {
      default: 1,
      alias: 'w',
      description:
        'Specifies the maximum number of workers the worker-pool ' +
        'will spawn for running tests. This defaults to the number of the ' +
        'cores available on your machine. (its usually best not to override ' +
        'this default)',
      type: 'number'
    }
  };
}

module.exports = getOptions;
