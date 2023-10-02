const fs = require('fs');

function formatJestResults(fileName) {
  const data = fs.readFileSync(fileName, { encoding: 'utf-8' });
  const jestResults = JSON.parse(data);
  const formattedResults = formatResults(jestResults);
  return formattedResults;
}

function formatResults(jestResults) {
  const results = jestResults.testResults[0];
  const failedTests = [];
  results.assertionResults.forEach(r => {
    if (r.status == 'failed') {
      failedTests.push({
        testName: r.fullName,
        details: r.failureDetails
      })
    }
  });

  if(!failedTests.length && results.status == 'failed'){
    failedTests.push({
      testName: 'Entire test suite',
      details: results.message
    });
  }

  return {
    failedCount: failedTests.length,
    results: failedTests
  };
}


module.exports = {
  formatJestResults
};
