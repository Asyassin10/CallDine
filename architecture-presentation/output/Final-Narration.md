# CallDine: four workflows

## 1. Knowledge base pipeline

### 1. Upload restaurant PDF

The admin uploads restaurant information through Next.js and FastAPI.

### 2. Store PDF in S3

FastAPI stores the original PDF in Amazon S3.

### 3. Textract reads the PDF

FastAPI asks Textract to extract the text and retrieves the results.

### 4. Split text into chunks

The backend splits the text into smaller chunks.

### 5. Amazon Titan Text Embeddings V2

Titan Text Embeddings converts each chunk into a numerical vector.

### 6. Store embeddings in Qdrant

FastAPI stores the vectors and source text in Qdrant, running in Docker.

This pipeline prepares restaurant knowledge. FastAPI coordinates S3, Textract, text chunking, Titan embeddings and Qdrant. The search-knowledge tool later uses these stored chunks for retrieval-augmented generation. Background processing runs inside the FastAPI application.

## 2. Complete voice conversation

### 1. Customer speaks

The browser captures the customer’s microphone audio and finishes the turn after a short silence.

### 2. Upload to FastAPI

Next.js forwards the completed audio turn to the FastAPI voice service.

### 3. Transcribe to text

FastAPI sends the audio to Amazon Transcribe Streaming, which produces the transcript.

### 4. Send transcript to chat

The transcript returns to the browser, which submits it to FastAPI Chat Service.

### 5. Bedrock + tools

Chat Service sends conversation context to Bedrock and executes any requested business tools.

### 6. Return answer text

FastAPI returns a cleaned answer to the browser. The browser then requests speech.

### 7. Polly creates speech

FastAPI sends the answer to Polly and returns MP3 audio through Next.js.

### 8. Customer hears reply

The browser plays the reply, then resumes listening.

FastAPI creates the Chime meeting and attendee, and the browser joins that session. Separately, the browser captures completed microphone turns for the assistant. There is no direct Chime-to-Transcribe bridge. Audio uploads through Next.js to FastAPI, which uses Transcribe Streaming. The transcript returns to the browser and is submitted to Chat Service. Bedrock chooses tools, FastAPI executes them, and Bedrock generates the answer. The browser submits the cleaned answer to the speech endpoint. FastAPI invokes Polly, and the browser plays the MP3 response. Guardrails are optional on the Bedrock chat calls.

## 3. AI tools and RAG

### 1. search-knowledge

RAG: retrieve restaurant knowledge from PDFs.

### 2. search-menu

Find dishes, prices, availability and stock.

### 3. check-order-items

Validate quantities, stock and the subtotal.

### 4. create-order-draft

Save a delivery draft after address approval.

### 5. confirm-order

Recheck stock and confirm the approved draft.

### 6. check-table-availability

Check table capacity and booking overlaps.

### 7. create-reservation-draft

Save an unconfirmed booking.

### 8. confirm-reservation

Recheck availability, assign a table and confirm.

The knowledge tool uses RAG, which means retrieval-augmented generation. FastAPI embeds the query using Titan, searches Qdrant, and returns the four most relevant chunks to Bedrock as a tool result. The other tools use restaurant business services and the operational database. Drafts are separate from confirmation. The prompts ask for customer approval, while the service checks model-supplied confirmation flags and business conditions. The main chat path uses Bedrock tools and Python dispatch, not the separate prototype MCP adapter.

### Bedrock Guardrails

“When configured, Amazon Bedrock Guardrails can filter prompt-injection and jailbreak attempts, harmful or toxic content, and blocked words. CallDine can attach this policy to Bedrock chat calls and handle blocked responses. The policy is optional; its deployed AWS configuration has not been verified.”

Reference: [Amazon Bedrock Guardrails policy components](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-components.html).

## 4. SageMaker demand forecasting

### 1. Prepare order history

The planned pipeline would aggregate historical orders by day and menu category.

### 2. Store training dataset

The prepared time-series data would be stored in S3.

### 3. Train DeepAR

SageMaker would train and evaluate a DeepAR forecasting model.

### 4. Predict future demand

Inference would produce seven-day category forecasts and prediction ranges.

### 5. Apply business rules

Backend business rules would turn forecasts into preparation and inventory recommendations.

### 6. Show admin dashboard

Next.js would display the forecast and recommendations to the restaurant admin.

This is a planned feature. The current recommendations page shows static demo values. Training, inference and dashboard integration are not connected. Daily category demand does not establish the busiest hourly window or staffing needs without additional data and business rules. Forecasting is independent of the Bedrock conversation model.