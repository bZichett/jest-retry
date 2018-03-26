# Motivation

E2E test failures due to reasons outside the domain of code.  

Ex: Network timeouts, flaky endpoints etc.

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