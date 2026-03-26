# Epic Voice Agent

A medical billing specialist dashboard integrated with an AI voice agent that handles outbound insurance calls and claim resolution. The application simulates a production AWS environment locally using LocalStack.

---

## Overview

Epic Voice Agent gives billing specialists a centralized dashboard to view and manage patient claims. When a specialist opens a patient's record, the AI voice agent automatically places an outbound call to the insurance company, navigates the conversation, and works to resolve the claim — handling pending claims, documentation requests, denials, and approvals.

The agent speaks using the browser's built-in Text-to-Speech, listens for the insurance rep's responses via the microphone, transcribes them in real time, and uses Groq (Llama 3.3 70B) to generate the next response — all grounded in the patient's real claim data from DynamoDB.

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
| AI Conversation | Groq API (Llama 3.3 70B) |
| Speech-to-Text | Web Speech API (browser-native) |
| Text-to-Speech | Web Speech Synthesis API (browser-native) |
| Local AWS | LocalStack + Docker |

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [LocalStack CLI](https://docs.localstack.cloud/getting-started/installation/)
- [Node.js](https://nodejs.org/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [jq](https://stedolan.github.io/jq/) — install via `brew install jq`
- A [Groq API key](https://console.groq.com) — free tier, no credit card required

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

All patient endpoints are routed through AWS API Gateway → Lambda → DynamoDB.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patients` | Fetch all patients |
| GET | `/api/patients/:id` | Fetch a single patient by ID |
| PATCH | `/api/patients/:id` | Update a patient's claim status |
| GET | `/config` | Expose client-side environment config (Groq key) |

### Example Requests
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
GROQ_API_KEY=your_groq_api_key_here
```

> `API_BASE_URL`, `COGNITO_USER_POOL_ID`, and `COGNITO_CLIENT_ID` are regenerated each time LocalStack restarts. The setup script handles these automatically and will not touch your `GROQ_API_KEY`.

The `GROQ_API_KEY` is served to the frontend at runtime via the `/config` endpoint — it is never hardcoded in client-side JavaScript.

---

## Voice Agent

### How It Works

1. Open a patient record from the patient list
2. On the dashboard, press **Start Call**
3. The agent introduces itself and references the patient's real claim ID and name
4. Speak the insurance rep's responses into your microphone
5. The agent transcribes your input, sends it to Groq, and speaks the AI's reply back
6. The conversation loops until you press **End Call**

### Scenarios the Agent Handles

| Scenario | Agent Behavior |
|---|---|
| Claim is pending | Asks what is blocking it, pushes for a timeline |
| Documentation needed | Confirms which docs are needed, asks for fax/portal and reference number |
| Claim denied | Requests denial code, pursues peer-to-peer review or appeals process |
| Claim approved | Confirms amount and payment date, asks for EOB, closes professionally |

### Browser Support

The voice agent uses the Web Speech API for both STT and TTS. This is best supported in **Google Chrome**. Firefox and Safari have limited or no support for `SpeechRecognition`.

---

## Notes

- LocalStack does not persist state between restarts. Always run `./setup-localstack.sh` after starting LocalStack to recreate all AWS resources.
- The `.env` file is updated automatically by the setup script — your `GROQ_API_KEY` is never overwritten.
- The voice agent is designed for outbound calls to insurance companies, not inbound calls from patients.
- For best voice agent performance, use the app in a quiet environment and speak clearly after the agent finishes its response.