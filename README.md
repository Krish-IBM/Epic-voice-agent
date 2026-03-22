# Epic Voice Agent

A medical billing specialist dashboard integrated with a voice agent for handling inbound insurance calls and claim management. The application simulates a production AWS environment locally using LocalStack.

---

## Overview

Epic Voice Agent provides billing specialists with a centralized dashboard to view and manage patient claims. The system is designed to support a voice agent that can handle inbound calls, look up claim statuses, and update records in real time — all backed by AWS services running locally via LocalStack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | AWS DynamoDB (LocalStack) |
| Serverless | AWS Lambda (LocalStack) |
| API | AWS API Gateway (LocalStack) |
| Auth | AWS Cognito (LocalStack) |
| Local AWS | LocalStack + Docker |

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [LocalStack CLI](https://docs.localstack.cloud/getting-started/installation/)
- [Node.js](https://nodejs.org/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [jq](https://stedolan.github.io/jq/) — install via `brew install jq`

---

## Getting Started

### First Time Setup

If this is your first time running the project, make the setup script executable by running this once:
```bash
chmod +x './setup-localstack.sh'
```

### Startup Flow

Follow these steps every time you want to run the project:

1. Open **Docker Desktop** and wait for it to finish loading
2. Start LocalStack in a terminal and wait for `Ready`:
```bash
localstack start
```
3. In a new terminal, run the setup script from the project root:
```bash
./setup-localstack.sh
```
4. Start the Express server:
```bash
node index.js
```
5. Open the app in your browser:
```
http://localhost:3000
```

### Test Login Credentials
```
Email:    admin@epicvoice.com
Password: Admin1234!
```

---

## API Endpoints

All endpoints are routed through AWS API Gateway → Lambda → DynamoDB.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patients` | Fetch all patients |
| GET | `/api/patients/:id` | Fetch a single patient by ID |
| PATCH | `/api/patients/:id` | Update a patient's claim status |

### Example Request
```bash
# Get all patients
curl http://localhost:3000/api/patients

# Get a single patient
curl http://localhost:3000/api/patients/PT001

# Update claim status
curl -X PATCH http://localhost:3000/api/patients/PT001 \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

---

## Environment Variables

The setup script automatically updates the `.env` file on each run. The following variables are required:
```
API_BASE_URL=http://localhost:4566/restapis/<api-id>/dev/_user_request_
COGNITO_USER_POOL_ID=<user-pool-id>
COGNITO_CLIENT_ID=<client-id>
```

> These values are regenerated each time LocalStack restarts. The setup script handles this automatically.

---

## Notes

- LocalStack does not persist state between restarts. Always run `./setup-localstack.sh` after starting LocalStack to recreate all AWS resources.
- The `.env` file is updated automatically by the setup script — no manual changes needed.