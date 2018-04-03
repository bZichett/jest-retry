## J<sup>e</sup>&frasl;<sub>u</sub>st Retry

###  Motivation

E2E test failures due to reasons outside the domain of source code, including:

1) Network timeouts
1) Flaky endpoints etc.
1) Login issues
1) Flaky selenium selectors (bad code which is hard to diagnose)
1) Whatever other mishaps, etc.

### Setup
Create a run-config to pass into `jest-retry`

### Example run
```js
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
    flakyFailureMessages: ['Network timeout'],
    flakyMarkAll: false,
    flakyWaitBeforeRerun: 1000,
    // Jest options
    setupTestFrameworkScriptFile: 'jest-config.js',
    maxWorkers: 1
});
```

### Test

`npm run test` runs a short 2 test suite in which 
a failure occurs and is forced to pass on the second retry

#### Test output

```
☁  jest-retry [master] npm run test

> jest-retry@1.0.8 test /code/jest-retry
> ./test/run.js

 PASS  test/always-pass.test.js
 FAIL  test/conditional-fail.test.js
  ● mocks/conditional-fail › conditionally fails

    expect(received).toBe(expected) // Object.is equality
    
    Expected value to be:
      false
    Received:
      true

      1 | describe('mocks/conditional-fail', async () => {
      2 |   it('conditionally fails', async () => {
    > 3 |     if (!process.env.SKIP) expect(true).toBe(false);
      4 |   });
      5 | });
      6 | 
      
      at Object.it (test/conditional-fail.test.js:3:41)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        0.28s, estimated 1s
Ran all test suites.

flakyDictionaryCount: {
  "Expected value to be": 1
}

Retrying the following test suites:  [
  "/code/jest-retry/test/conditional-fail.test.js"
]
===============================================

 PASS  test/conditional-fail.test.js
  mocks/conditional-fail
    ✓ conditionally fails

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.099s, estimated 1s
Ran all test suites.

All failures have now passed

Test retries result: true
```