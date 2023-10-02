require('dotenv').config();
const fs = require('fs');
const { getTestResults } = require('./jestRunner');
const OpenAI = require('openai');
const openai = new OpenAI();
const codeBlockRegex = /```.*?\n(.*?)```/s;

const testFilePath = './examples/get-data/get-data.test.js';
const outputFilePath = './examples/get-data/get-data.js'
const maxAttempts = 3;

async function run() {
  const testData = fs.readFileSync(testFilePath, { encoding: 'utf-8' });
  const messages = [
    {
      role: 'system',
      content: 'You are a senior-level Node.js programmer. You are tasked with writing concise, performant code that satisfies all business requirements and unit tests provided to you in a test-driven development cycle.'
    },
    {
      role: 'user',
      content: `Write code that satisfies all of the provided unit tests. Use the same packages from the unit tests, if applicable. Respond only with the code and do not enclose it in tildes. ${testData}`
    }
  ];

  let isSuccess = false;
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const result = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-4',
      temperature: .7
    });

    let response = result.choices[0].message;
    const match = codeBlockRegex.exec(response.content);
    if (match) {
      // This means OpenAI didn't listen to us when we said return the code only. So grab the code inside the block.
      fs.writeFileSync(outputFilePath, match[1].trim());
    } else {
      fs.writeFileSync(outputFilePath, response.content);
    }

    try {
      const results = await getTestResults(testFilePath);
      if (results.failedCount > 0) {
        messages.push(response);
        messages.push({
          role: 'user',
          content: `That code caused some unit test failures. Please update the code based on the errors below. Return the full source instead of just the updates. Respond with only the code and nothing else. ${results}`
        })
        console.log(`Had ${results.failedCount} failed unit tests. ${attempts == (maxAttempts - 1) ? '' : 'Regenerating code.'}`);
      } else {
        isSuccess = true;
        break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (isSuccess) {
    console.log('Code was generated and all unit tests have been satisfied.');
    fs.rmSync(outputFilePath);
  } else {
    console.log('Max attempts exhausted and unit tests are still failing. The most recent iteration is on your file system.');
  }
}

run();
