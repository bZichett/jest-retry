function isKnownIssue(knownIssuePaths, testDir){
  return knownIssuePaths && knownIssuePaths.find(issuePath => {
    return testDir.includes(issuePath)
  })
}

function processFlakiness(testResults, knownIssuePaths, retryPatterns, flakyMarkAll) {
  // Counter for how many of each flaky failure scenario was detected
  const flakyDictionaryCount = retryPatterns.reduce((current, message) => {
    current[message] = 0;
    return current;
  }, {});

  const failingTests = testResults.filter(
    testResult => testResult.numFailingTests > 0
  );

  const flakyFailingTests = failingTests.filter(testResult =>
    retryPatterns.some(errorMessage => {
      const isFlaky = testResult.failureMessage.includes(errorMessage);
      if (isFlaky) {
        flakyDictionaryCount[errorMessage] += 1;
      }
      return flakyMarkAll || isFlaky;
    })
  );

  if (flakyFailingTests.length !== failingTests.length) {
    return false;
  }

  const removedKnownIssueTests = []
  const flakyFailingTestPaths = flakyFailingTests
    .map(testResult => testResult.testFilePath)
    .filter((testDir, idx, array) => array.indexOf(testDir) === idx) // unique
    .filter((testDir) => {
      // remove known issues from being re-ran
      const knownIssue = isKnownIssue(knownIssuePaths, testDir)
      if (knownIssue) {
        removedKnownIssueTests.push(testDir)
      }
      return !knownIssue
    });

  if (removedKnownIssueTests.length) {
    /* eslint-disable no-console */
    console.log("\nRemoving known issues from next run:",
      JSON.stringify(removedKnownIssueTests, null, 4)
    )
  }

  return {
    flakyDictionaryCount,
    flakyFailingTestPaths
  };
}

module.exports = processFlakiness