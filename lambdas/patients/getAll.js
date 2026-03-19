const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
  const data = await docClient.send(new ScanCommand({ TableName: "Patients" }));
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items),
  };
};