## Jest Retry

###  Motivation

E2E test failures due to reasons outside the domain of source code, including:

1) Network timeouts
1) Flaky endpoints etc.
1) Login issues
1) etc.

### Setup
Create a run-config to pass into `jest-retry`

### Example run
```
require('jest-retry')({
    debug: false,
    testDir: 'src/tests',
    testFilter: 'table-tests',
    // jest-junit is currently the only option
    outputTestResults: true,
    testResultsOutput: '.',
    
    // Test retry options
    flakyNumRetries: 2, // 0 for disable retry pattern
    flakyTestMock: false,
    flakyTestMockDir: 'src/mocks',
    flakyFailureMessages: ['Network timeout']
    flakyMarkAll: false,
    flakyWaitBeforeRerun: 1000,
    // Jest options
    setupTestFrameworkScriptFile: 'jest-config.js',
    maxWorkers: 1
}
```