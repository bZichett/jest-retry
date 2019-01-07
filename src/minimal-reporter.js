class MinimalReporter {
  constructor(globalConfig, options) {
    this.silent = globalConfig.silent
    this.suiteProgressIndex = 0
    console.log("\n")
  }

  onRunStart(results, options) {
    this.numTotalTestSuites = results.numTotalTestSuites
  }

  onTestResult(contexts, results) {
    const fail = !!results.numFailingTests

    const progress = `${++this.suiteProgressIndex} / ${this.numTotalTestSuites}`
    console.log((fail
      ? `FAIL  `
      : `PASS  `),
      progress + ' ' +
      results.testResults[0].ancestorTitles[0]
    )

    const spacer = `           `
    if (fail && !this.silent) {
      let failures = 0, successes = 0
      results.testResults.forEach((result) => {
        if (result.status === 'failed') {
          console.log(spacer + ' ', ++failures, result.title)
        } else {
          successes++
        }
      })
      console.log(spacer, ` ( ${successes} successful test${successes.length > 1 ? 's' : ''} )`)
    }
  }
}

module.exports = MinimalReporter;