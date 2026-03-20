#!/bin/bash

# ─── AWS CREDENTIALS ──────────────────────────────────────
echo "🔑 Configuring AWS credentials..."
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"
echo "✅ Credentials set"

echo "🚀 Setting up LocalStack for Epic Voice Agent..."

# ─── CONFIG ───────────────────────────────────────────────
ENDPOINT="http://localhost:4566"
REGION="us-east-1"
ACCOUNT="000000000000"
PROJECT_DIR="/Users/krishchavan/Documents/Epic Voice Agent"
LAMBDAS_DIR="$PROJECT_DIR/lambdas"
PATIENTS_FILE="$PROJECT_DIR/client/patients.json"
ENV_FILE="$PROJECT_DIR/.env"

# ─── DYNAMODB ─────────────────────────────────────────────
echo ""
echo "📦 Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name Patients \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

echo "📦 Loading patients into DynamoDB..."
cat "$PATIENTS_FILE" | jq -c '.patients[]' | while read item; do
  aws dynamodb put-item \
    --table-name Patients \
    --item "$(echo $item | jq '{
      id: {S: .id}, name: {S: .name}, mrn: {S: .mrn}, dob: {S: .dob},
      gender: {S: .gender}, phone: {S: .phone}, address: {S: .address},
      insurance: {S: .insurance}, policyNumber: {S: .policyNumber},
      claimId: {S: .claimId}, serviceDate: {S: .serviceDate},
      provider: {S: .provider}, claimAmount: {S: .claimAmount},
      claimType: {S: .claimType}, status: {S: .status}
    }')" \
    --endpoint-url $ENDPOINT \
    --region $REGION > /dev/null
done
echo "✅ DynamoDB ready"

# ─── LAMBDA ───────────────────────────────────────────────
echo ""
echo "⚡ Zipping Lambda functions..."
cd "$LAMBDAS_DIR"
zip -j patients/getAll.zip patients/getAll.js > /dev/null
zip -j patients/getById.zip patients/getById.js > /dev/null
zip -j patients/updateStatus.zip patients/updateStatus.js > /dev/null

echo "⚡ Deploying Lambda functions..."
aws lambda create-function \
  --function-name getPatients \
  --runtime nodejs18.x \
  --handler getAll.handler \
  --zip-file fileb://patients/getAll.zip \
  --role arn:aws:iam::${ACCOUNT}:role/lambda-role \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws lambda create-function \
  --function-name getPatientById \
  --runtime nodejs18.x \
  --handler getById.handler \
  --zip-file fileb://patients/getById.zip \
  --role arn:aws:iam::${ACCOUNT}:role/lambda-role \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws lambda create-function \
  --function-name updatePatientStatus \
  --runtime nodejs18.x \
  --handler updateStatus.handler \
  --zip-file fileb://patients/updateStatus.zip \
  --role arn:aws:iam::${ACCOUNT}:role/lambda-role \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null
echo "✅ Lambdas ready"

# ─── API GATEWAY ──────────────────────────────────────────
echo ""
echo "🔌 Creating API Gateway..."
API_ID=$(aws apigateway create-rest-api \
  --name "EpicVoiceAgentAPI" \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'id' --output text)

ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'items[0].id' --output text)

# /patients resource
PATIENTS_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part patients \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'id' --output text)

# GET /patients
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PATIENTS_ID \
  --http-method GET \
  --authorization-type NONE \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PATIENTS_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT}:function:getPatients/invocations \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

# /patients/{id} resource
PATIENT_ID_RESOURCE=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $PATIENTS_ID \
  --path-part "{id}" \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'id' --output text)

# GET /patients/{id}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PATIENT_ID_RESOURCE \
  --http-method GET \
  --authorization-type NONE \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PATIENT_ID_RESOURCE \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT}:function:getPatientById/invocations \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

# PATCH /patients/{id}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PATIENT_ID_RESOURCE \
  --http-method PATCH \
  --authorization-type NONE \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PATIENT_ID_RESOURCE \
  --http-method PATCH \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT}:function:updatePatientStatus/invocations \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

echo "✅ API Gateway ready"

# ─── COGNITO ──────────────────────────────────────────────
echo ""
echo "🔐 Setting up Cognito..."
USER_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name EpicVoiceAgentPool \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=false,RequireLowercase=false,RequireNumbers=false,RequireSymbols=false}" \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'UserPool.Id' --output text)

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name EpicVoiceAgentClient \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --endpoint-url $ENDPOINT \
  --region $REGION \
  --query 'UserPoolClient.ClientId' --output text)

aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@epicvoice.com \
  --temporary-password Admin1234! \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username admin@epicvoice.com \
  --password Admin1234! \
  --permanent \
  --endpoint-url $ENDPOINT \
  --region $REGION > /dev/null

echo "✅ Cognito ready"

# ─── UPDATE .ENV ──────────────────────────────────────────
echo ""
echo "📝 Updating .env..."
API_BASE_URL="http://localhost:4566/restapis/${API_ID}/dev/_user_request_"

update_env() {
  local key=$1
  local value=$2
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

update_env "API_BASE_URL" "$API_BASE_URL"
update_env "COGNITO_USER_POOL_ID" "$USER_POOL_ID"
update_env "COGNITO_CLIENT_ID" "$CLIENT_ID"

echo "✅ .env updated"

# ─── DONE ─────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LocalStack setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API Base URL : $API_BASE_URL"
echo "User Pool ID : $USER_POOL_ID"
echo "Client ID    : $CLIENT_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "▶ Start your server: node index.js"