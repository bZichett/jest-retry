module.exports = {
  setupTestFrameworkScriptFile: false,
  rootDir: '.',
  testDir: 'test',
  testResultsOutput: 'junit.xml',
  flakyTestMock: true,
  flakyNumRetries: Infinity,
  flakyWaitBeforeRerun: false,
  flakyMarkAll: false,
  flakyFailureMessages: []
}