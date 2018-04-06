/* eslint-disable no-console */
const jest = require('jest-cli');
const jestJunit = require('jest-junit');

const { newLineWrap: nW } = require('./string');
const processFlakiness = require('./process-flakiness');
const processTestResults = require('./process-test-results');
let prevResults = '';

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
    done(nW('Found real failures'));
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
        console.log('\nAll failures have now passed');
        return done(true);
      }

      console.log(nW('Retries have failures...'));

      if (retryNumber === flakyOptions.flakyNumRetries) {
        return done(`Max number of retries reached: ${retryNumber}`);
      }

      if (flakyOptions.flakyNumRetries === Infinity) {
        const testResults = JSON.parse(JSON.stringify(lastResults.testResults)).map(res => {
          delete res.perfStats;
          res.testResults.forEach(it => {
            delete it.duration;
          });
          return res;
        });
        const strTestResults = JSON.stringify(testResults);
        if (prevResults === strTestResults) {
          return done(`Stoped after ${retryNumber} retries with same results`);
        }
        prevResults = strTestResults;
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
