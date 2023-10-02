# Test-Driven Development with AI

This is a proof of concept showing how you can use Generative AI to write your code from human-written tests. The concept here is practicing test-driven development, but using AI to completely write the code.

## How it works

![Workflow of the script](https://readysetcloud.s3.amazonaws.com/tdd_with_ai_1.png)

This script uses OpenAI to generate code that satisfies a set of unit tests. When you run it, the following actions will be performed:

1. Load the unit tests and provide them to OpenAI asking to write code that satisfies them
2. Save the returned code locally
3. Run your unit tests against the returned code
4. If all unit tests pass, stop execution
5. If one or more unit tests fail, provide the output back to OpenAI and ask it to try again
6. Go to Step 2

## Setup

To run the script, you will need to have an OpenAI account with an active API key. This API key will be used in a local environment file to allow the script to communicate with OpenAI and generate your code.

1. Create an account and API key on [OpenAI](https://openai.com/blog/openai-api)
2. Clone this repository
3. Create a file called `.env` in the root directory
4. Add the line `OPEN_API_KEY=<your openai api key>`

With that, you're all setup! Now you can run the script and see AI-powered TDD in action

## Running the script

There are three variables contained in [index.js](./index.js) that you can change the behavior of the script.

* `testFilePath` - Relative location of the file containing [jest-compatible](https://jestjs.io/) unit tests
* `outputFilePath` - The name of the file to create with the result of the OpenAI code generation
* `maxAttempts` - Circuit breaker to prevent the script from running in an infinite loop. If the AI cannot write code that satisfies all your unit tests in this number of attempts, the script will abort.

This repository provides one example and has setup the script to use it without any code changes. The example is a simple data load function that gets data from DynamoDB, validates if the caller is the owner of the data, and returns the data in the designated shape.

To run the script you can simply run:

```bash
npm run test
```

This will generate the code and evaluate it against your unit tests. If all unit tests do not run successfully, it will provide the failed tests back to OpenAI and ask it to try again.

## Considerations

The generated code will most likely need touching up. Be it with styling, parameterization, or package installation, it will require human intervention to get to 100% complete.

That said, if we can get AI to generate our code 80% of the way with our unit tests completely satisfied, developer productivity will skyrocket. This proof of concept was intended to show the capabilities we have today and how exciting our future is if we approach AI the right way.

For more information, you can [read my blog post](https://readysetcloud/blog/allen.helton/tdd-with-ai) on the subject.
