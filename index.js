const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
// app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname,'./client')));

// Serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client/index.html'));
});


// GET /api/patients (through DynamoDB)
// app.get("/api/patients", async (req, res) => {
//   try {
//     const data = await docClient.send(new ScanCommand({ TableName: "Patients" }));
//     res.json(data.Items);
//   } catch (err) {
//     console.error("DynamoDB error:", err);
//     res.status(500).json({ error: "Failed to fetch patients" });
//   }
// });




// REST calls through API Gateway

const API_BASE = process.env.API_BASE_URL || "http://localhost:4566/restapis/wsbtzhpafx/dev/_user_request_";

app.get("/api/patients", async (req, res) => {
  const response = await fetch(`${API_BASE}/patients`);
  const data = await response.json();

  // API Gateway wraps the response in a body string, parse it
  const patients = typeof data.body === "string" ? JSON.parse(data.body) : data;
  
  res.json(patients);
});

app.get("/api/patients/:id", async (req, res) => {
  const response = await fetch(`${API_BASE}/patients/${req.params.id}`);
  const data = await response.json();

  // API Gateway wraps the response in a body string, parse it
  const patient = typeof data.body === "string" ? JSON.parse(data.body) : data;
  
  res.json(patient);
});

app.patch("/api/patients/:id", async (req, res) => {
  const response = await fetch(`${API_BASE}/patients/${req.params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();

  // API Gateway wraps the response in a body string, parse it
  const patient = typeof data.body === "string" ? JSON.parse(data.body) : data;
  
  res.json(patient);
});








// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
