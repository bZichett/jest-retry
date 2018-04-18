/* eslint-disable no-console */
const jest = require('jest-cli');
const jestJunit = require('jest-junit');

const { newLineWrap: nW } = require('./string');
const deepEqual = require('./deep-equal');
const processFlakiness = require('./process-flakiness');
const processTestResults = require('./process-test-results');

let previousFailureMap = {};

function retryIfFlakyTests({
  results: lastResults,
  jestConfig,
  testDirs,
  flakyOptions,
  retryNumber = 1,
  done
}) {
  const lastTestResults = lastResults.testResults;

  const flakyResults = processFlakiness(
    lastTestResults,
    flakyOptions.flakyFailureMessages,
    flakyOptions.flakyMarkAll
  );

  if (!flakyResults) {
    done(false, 'Found real failures');
  }

  const { flakyFailingTestPaths, flakyDictionaryCount } = flakyResults;

  const updatedConfig = Object.assign({}, jestConfig, {
    testMatch: flakyFailingTestPaths,
    _: null
  });

  console.log(nW(`flakyDictionaryCount: ${JSON.stringify(flakyDictionaryCount, null, 2)}`));

  console.log('Retrying the following test suites: ', JSON.stringify(flakyFailingTestPaths, null, 2))

  if (flakyOptions.flakyTestMock && retryNumber === 1) {
    process.env.SKIP = true;
  }

  console.log('===============================================\n');

  setTimeout(() => {
    jest.runCLI(updatedConfig, testDirs).then(response => {
      const { results: flakyResults } = response;
      const mergedTestResults = processTestResults(lastResults, flakyResults);

      if (flakyOptions.outputTestResults) {
        jestJunit(mergedTestResults);
      }

      if (flakyResults.success) {
        return done(true, `All failures have now passed after ${retryNumber} run${retryNumber !== 1 ? 's' : ''}`);
      }

      console.log(nW('Retries have failures...'));

      if (retryNumber === flakyOptions.flakyNumRetries) {
        return done(false, `Max number of retries reached: ${retryNumber}`);
      }

      if (flakyOptions.flakyNumRetries === Infinity) {
        const thisFailureMap = {}
        lastResults.testResults.map((result) => {
          if (result.numFailingTests) {
            result.testResults.forEach(it => {
              if(it.status === 'failed') {
                thisFailureMap[it.fullName] = true
              }
            });
          }
        })

        if (deepEqual(previousFailureMap, thisFailureMap)) {
          return done(false, `Stopped after ${retryNumber} retries with same results`);
        }

        previousFailureMap = thisFailureMap;
      }

      retryIfFlakyTests({
        results: mergedTestResults,
        jestConfig,
        testDirs,
        flakyOptions,
        retryNumber: retryNumber + 1,
        done
      });
    });
  }, flakyOptions.flakyWaitBeforeRerun);
}

module.exports = retryIfFlakyTests;
