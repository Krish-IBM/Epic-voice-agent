const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing patient id" }) };
  }

  const data = await docClient.send(new GetCommand({
    TableName: "Patients",
    Key: { id },
  }));

  if (!data.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: "Patient not found" }) };
  }

  return { statusCode: 200, body: JSON.stringify(data.Item) };
};