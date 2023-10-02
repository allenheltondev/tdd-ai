const { exec: execCb } = require('child_process');
const { promisify } = require('util');
const { formatJestResults } = require('./jestFormatter');
const exec = promisify(execCb);
const outputFile = 'testResults.json';

async function runJestTests(folderPath) {
  try {
    await exec(`npx jest --testPathPattern=${folderPath} --json --outputFile=${outputFile}`);
  } catch (error) {
    // this means tests failed
  }
  finally {
    const results = formatJestResults(outputFile);
    console.log(results);
    return results;
  }
}

async function getTestResults(folderPath) {
  const jestResults = await runJestTests(folderPath);
  return jestResults;
}

module.exports = {
  getTestResults
};
