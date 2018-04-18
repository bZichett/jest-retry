class MinimalReporter {
  constructor(globalConfig, options) {
    this.silent = globalConfig.silent
    console.log("\n")
  }

  onTestResult(contexts, results) {
    const fail = !!results.numFailingTests

    console.log(fail
      ? `FAIL   `
      : `PASS   `,
      results.testResults[0].ancestorTitles[0]
    )

    if (fail && !this.silent) {
      let failures = 0, successes = 0
      results.testResults.forEach((result,) => {
        if (result.status === 'failed') {
          console.log("     ", ++failures, result.title)
        } else {
          successes++
        }
      })
      console.log(`      ( ${successes} successful test${successes.length > 1 ? 's' : ''} )`)
    }
  }
}

module.exports = MinimalReporter;