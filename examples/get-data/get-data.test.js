const { handler } = require('./get-data');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const ddbMock = mockClient(DynamoDBClient);

let event;
const mockedItem = {
  "pk": { "S": "myTenantId#entityId" },
  "sk": { "S": "metadata" },
  "type": { "S": "post" },
  "ownerId": { "S": "test-user" },
  "status": { "S": "Draft" },
  "tags": {
    "L": [
      { "S": "serverless" },
      { "S": "ai" }
    ]
  }
};

describe('Get access controlled entity', () => {
  beforeEach(() => {
    event = {
      pathParameters: {
        entityId: 'entityId'
      },
      authorizer: {
        userId: 'test-user',
        tenantId: 'myTenantId'
      }
    };
    ddbMock.reset();
  });

  test('Returns unmarshalled result when caller is owner and item exists', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: mockedItem,
    });
    const result = await handler(event);
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('id', 'entityId');
    expect(body).toHaveProperty('type', 'post');
    expect(body).toHaveProperty('status', 'Draft');
    expect(body).toHaveProperty('tags', ['serverless', 'ai']);
    expect(body).not.toHaveProperty('ownerId');
    expect(body).not.toHaveProperty('pk');
    expect(body).not.toHaveProperty('sk');
  });

  test('Includes empty tags array even if none are provided', async () => {
    const noTags = { ...mockedItem };
    delete noTags.tags;
    ddbMock.on(GetItemCommand).resolves({ Item: noTags });

    const result = await handler(event);
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('id', 'entityId');
    expect(body).toHaveProperty('type', 'post');
    expect(body).toHaveProperty('status', 'Draft');
    expect(body).toHaveProperty('tags', []);
    expect(body).not.toHaveProperty('ownerId');
    expect(body).not.toHaveProperty('pk');
    expect(body).not.toHaveProperty('sk');
  })

  test('Returns 401 when caller is not the owner and item exists', async () => {
    ddbMock.on(GetItemCommand).resolves({ Item: mockedItem });
    event.authorizer.userId = 'otherUser';
    const result = await handler(event);
    expect(result).toHaveProperty('statusCode', 401);
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'You are not allowed to view the requested resource');
  });

  test('Returns 404 when the item is not found', async () => {
    ddbMock.on(GetItemCommand).resolves({ Item: null });
    const result = await handler(event);
    expect(result).toHaveProperty('statusCode', 404);
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'The requested resource could not be found');
  });

  test('Returns 500 when DynamoDB throws error', async () => {
    ddbMock.on(GetItemCommand).rejects('ResourceNotFoundException');

    const result = await handler(event);
    expect(result).toHaveProperty('statusCode', 500);
    expect(result).toHaveProperty('body');

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Something went wrong');
  });
});
