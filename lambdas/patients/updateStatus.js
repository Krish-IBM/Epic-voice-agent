const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const id = event.pathParameters?.id;
  const { status } = JSON.parse(event.body || "{}");

  if (!id || !status) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing id or status" }) };
  }

  await docClient.send(new UpdateCommand({
    TableName: "Patients",
    Key: { id },
    UpdateExpression: "SET #s = :status",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":status": status },
  }));

  return { statusCode: 200, body: JSON.stringify({ message: "Status updated" }) };
};