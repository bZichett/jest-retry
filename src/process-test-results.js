function processTestResults(lastResults, flakyResults) {
  const lastTests = lastResults.testResults;
  const flakyTests = flakyResults.testResults;

  flakyTests.forEach(flaky => {
    // get the failed test result from previous run
    const outdatedResult = lastTests.find(
      last => last.testFilePath === flaky.testFilePath
    );

    if (outdatedResult) {
      outdatedResult.testResults.forEach((result, idx) => {
        if (result.status === 'failed') {
          // Conflicts with flakyNumRetries=Infinity
          flaky.testResults[idx].title += ' / FLAKY';
        }
      });

      // overwrite the failed test with the updated flaky rerun
      const overwriteIndex = lastResults.testResults.indexOf(outdatedResult);
      lastTests[overwriteIndex] = flaky;
    }
  });

  return lastResults;
}

module.exports = processTestResults