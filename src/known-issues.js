function passesWithoutKnownIssues(knownIssueArray, results) {
  const knownIssuePaths = []

  const fails = results.testResults.find(result => {
    if (result.numFailingTests === 0) return false

    const knownIssue = knownIssueArray.find((issue) =>
      result.testFilePath.includes(issue)
    )
    if (knownIssue) {
      result.title += ' / KNOWN ISSUE'
      knownIssuePaths.push(result.testFilePath)
      return false
    }

    // Not a known issue and has failures
    return true
  })

  if (fails) return false
  else {
    if (knownIssuePaths.length) {
      /* eslint-disable no-console */
      console.log("Considering this a successful test run although there are known issues: ")
      console.log(JSON.stringify(knownIssuePaths, null, 2))
    }
    return true
  }
}

module.exports = passesWithoutKnownIssues