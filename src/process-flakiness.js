function processFlakiness(testResults, retryPatterns, flakyMarkAll) {
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

  const flakyFailingTestPaths = flakyFailingTests
    .map(testResult => testResult.testFilePath)
    .filter((testDir, idx, array) => array.indexOf(testDir) === idx); // unique

  return {
    flakyDictionaryCount,
    flakyFailingTestPaths
  };
}

module.exports = processFlakiness