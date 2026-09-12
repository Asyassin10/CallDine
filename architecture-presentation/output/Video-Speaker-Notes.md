# CallDine video speaker notes

## 1. CallDine AI restaurant assistant

CallDine helps restaurant customers use voice or text to ask questions, order food and reserve tables. The interface uses Next.js. FastAPI coordinates AWS AI services and the restaurant database. This walkthrough explains each stage and keeps the planned forecasting feature separate from working application code.

## 2. A customer request

### Step 1: Customer input

A text message or a completed voice transcript.

### Step 2: Next.js API proxy

Forward the request and session credentials.

### Step 3: FastAPI routes

Authenticate the user and call the service.

### Step 4: Chat and tools

Load memory, call Bedrock and execute selected tools.

### Step 5: Repositories

Read or save records through SQLModel.

### Step 6: Customer response

Return the answer through Next.js and save the conversation.

### Narration context

The browser sends requests to Next.js API handlers. These handlers forward the session token to FastAPI. Routes authenticate the request and services handle the work. Chat Service loads saved conversation history and calls Bedrock. Tool requests run in Python business services, which use repositories to access SQLite. Responses return through Next.js. Some chat answers stream tokens, while tool-assisted and voice answers return completed text.

## 3. Knowledge ingestion

### Step 1: Upload the PDF

Admin submits a document through Next.js and FastAPI.

### Step 2: Store in S3

Save the PDF under knowledge/ and record job metadata.

### Step 3: Extract the text

FastAPI starts Textract, polls status and fetches all pages.

### Step 4: Split into chunks

FastAPI creates 1,000-character chunks without overlap.

### Step 5: Create embeddings

Titan Text Embeddings V2 returns normalized 1,024-D vectors.

### Step 6: Index in Qdrant

FastAPI saves vectors, text and source metadata.

### Narration context

The admin uploads a PDF. FastAPI stores it in S3 and creates knowledge and job records in SQLite. An in-process background task starts asynchronous Textract detection. FastAPI polls the job and retrieves all text pages. It joins the detected lines, splits the text into one-thousand-character chunks, invokes Titan embeddings through Bedrock, and saves vectors plus document metadata in Qdrant. Progress updates go to SQLite. There is no separate durable queue in this implementation.

## 4. Knowledge retrieval

### Step 1: Customer question

Chat Service sends conversation context to Bedrock.

### Step 2: Select a tool

Bedrock requests search-knowledge. FastAPI dispatches it.

### Step 3: Embed the query

Titan converts the search query into a vector.

### Step 4: Search Qdrant

FastAPI queries cosine similarity and retrieves four chunks.

### Step 5: Return the evidence

FastAPI returns the chunks as a Bedrock tool result.

### Step 6: Answer the customer

Bedrock uses the retrieved restaurant text in its answer.

### Narration context

The assistant can search the restaurant documents when it needs a policy or another restaurant fact. Bedrock chooses the knowledge-search tool. FastAPI embeds the query with Titan, searches Qdrant and returns the top four text chunks as tool results. Bedrock then uses that evidence to produce an answer. Bedrock does not connect directly to Qdrant, and this project does not use managed Bedrock Knowledge Bases.

## 5. AI reasoning and tool execution

### Step 1: Conversation memory

Save the customer message and load saved messages.

### Step 2: Planner request

Send history and eight tool descriptions through Converse.

### Step 3: Controlled dispatch

Map tool names and inputs to Python service functions.

### Step 4: Business validation

Check stock, prices, booking availability and draft state.

### Step 5: Tool results

Return structured results. Allow up to four tool rounds.

### Step 6: Final answer

Return customer-facing text and save the assistant message.

### Narration context

The chat model is GPT-OSS 20B on Bedrock. The planner receives conversation history and eight tools. FastAPI dispatches tool selections to knowledge, menu, order or reservation services. Tool results return to Bedrock for the answer or a further tool round. The code allows up to four execution rounds. Guardrails are optional request configuration on chat calls. Their actual AWS policy configuration was not verified. Titan embedding calls do not use this chat guardrail helper.

## 6. The eight business tools

### Step 1: search-knowledge

Retrieve four relevant restaurant document chunks.

### Step 2: search-menu

Read menu names, prices, availability and stock.

### Step 3: check-order-items

Validate requested items and calculate the subtotal.

### Step 4: create-order-draft

Save a draft after the delivery address confirmation flag.

### Step 5: confirm-order

Recheck stock and confirm the customer’s draft.

### Step 6: check-table-availability

Check table capacity and overlapping bookings.

### Step 7: create-reservation-draft

Save the collected booking details as a draft.

### Step 8: confirm-reservation

Recheck availability, assign a table and confirm.

### Narration context

There are eight tools. Knowledge and menu search retrieve current information. Order tools validate items, create a delivery draft and confirm it. Reservation tools check availability, create a draft and assign a table when confirming. The language model chooses tool arguments, while the service code performs business checks. The separate prototype MCP adapter exposes similar tools but is not the path used by the main Bedrock chat service.

## 7. Voice input and transcription

### Step 1: Create the session

FastAPI creates a Chime meeting, attendee and conversation.

### Step 2: Capture microphone

Browser joins Chime and separately captures local PCM audio.

### Step 3: Detect a turn ending

About 1.8 seconds of silence ends the recorded utterance.

### Step 4: Upload the PCM turn

Next.js forwards the completed audio blob to FastAPI.

### Step 5: Transcribe the speech

FastAPI sends PCM chunks to Transcribe Streaming.

### Step 6: Submit the transcript

Browser posts the returned text to Chat Service.

### Narration context

FastAPI creates the Chime session and a voice conversation. The browser joins the meeting with the Chime SDK, but it also captures microphone audio locally for the assistant. After roughly one point eight seconds of silence, the browser uploads the completed PCM utterance. FastAPI reads it and sends chunks through the Transcribe Streaming client. The final transcript returns to the browser, which submits it to the chat endpoint. This is turn-based input, not a continuous microphone stream to the backend.

## 8. AI response and speech playback

### Step 1: Reason and act

Chat Service uses Bedrock and the restaurant tools.

### Step 2: Clean the answer

Remove formatting, emojis and internal identifiers.

### Step 3: Request speech

Browser posts the completed answer to the speech endpoint.

### Step 4: Synthesize with Polly

FastAPI selects the configured neural voice and MP3 format.

### Step 5: Play the response

MP3 bytes return through the app to the browser speaker.

### Step 6: Resume listening

Listen again after playback, or end a confirmed transaction.

### Narration context

The transcript follows the same chat and tool process as a text message. Voice responses are cleaned into natural speech. The browser posts the completed answer to the speech endpoint. FastAPI invokes Polly with the configured neural voice, then yields MP3 bytes back through the application. Browser playback streams the audio when supported, with a blob fallback. Listening resumes after playback. The frontend can end the call after detecting an order or reservation confirmation in the answer.

## 9. Call recording and conversation history

### Step 1: Mix both sides

Web Audio combines the microphone with assistant playback.

### Step 2: Record the call

MediaRecorder collects one WebM recording in the browser.

### Step 3: Upload recording

Next.js forwards the file to FastAPI when the call ends.

### Step 4: Store audio in S3

Save audios/calls/{conversation.id}.webm.

### Step 5: Save the reference

SQLite keeps the audio key and conversation messages.

### Step 6: Admin playback

FastAPI reads S3 audio and supports byte-range requests.

### Narration context

The browser mixes microphone input and the assistant’s played audio using Web Audio. MediaRecorder captures the mixed stream in WebM format. On call completion, the recording uploads through Next.js and FastAPI to S3. The conversation row stores the S3 key. Text messages remain in SQLite. When an admin plays the recording, FastAPI serves the stored audio and supports range reads for playback.

## 10. Delivery order confirmation

### Step 1: Find and validate

Search menu. Validate quantities, stock and subtotal.

### Step 2: Confirm the address

Collect the address and ask the customer to approve it.

### Step 3: Create the draft

Save the unconfirmed order and its items.

### Step 4: Review the summary

Repeat items, quantities, address and total.

### Step 5: Confirm and recheck

Check the confirmation flag and current stock.

### Step 6: Save the order

Reduce stock and mark the order confirmed.

### Narration context

The order flow retrieves actual menu data and checks stock. The assistant collects and repeats the delivery address. A draft requires a confirmed-address flag. The assistant then repeats the order summary and asks for final approval. On confirmation, the service rechecks availability, reduces stock and updates the order. These flags come from model tool arguments. The source does not demonstrate an independent consent token or atomic, idempotent stock updates.

## 11. Table reservation confirmation

### Step 1: Collect the details

Date, time, party size, customer name and phone.

### Step 2: Check availability

Find sufficient capacity with no overlapping two-hour booking.

### Step 3: Save a draft

Keep the collected details as an unconfirmed reservation.

### Step 4: Review the booking

Repeat the reservation summary and ask for approval.

### Step 5: Recheck the tables

Check the confirmation flag and current availability.

### Step 6: Assign and confirm

Choose an available table and save the confirmed booking.

### Narration context

The reservation service uses party size and two-hour booking windows to find suitable tables. It saves an unconfirmed draft from the collected details. The assistant asks the customer to approve the summary. On confirmation, the backend checks table availability again, assigns a suitable table and saves the confirmed state. The code does not establish race-free allocation under concurrent requests.

## 12. Planned SageMaker demand forecasting

### Step 1: Prepare history

Aggregate historical demand by day and menu category.

### Step 2: Create the dataset

Prepare time series and store training data in S3.

### Step 3: Train and evaluate

Train DeepAR and evaluate forecast quality.

### Step 4: Run inference

Generate seven-day category forecasts and quantile ranges.

### Step 5: Apply business rules

Derive preparation and inventory recommendations.

### Step 6: Show recommendations

Serve forecast results to the admin dashboard.

### Narration context

The proposed forecasting feature is independent of the chat model. Historical category demand would become a time-series dataset in S3. SageMaker DeepAR would train on that data and produce a seven-day forecast with prediction quantiles. A backend endpoint and business rules would turn predictions into dashboard recommendations. The current code has only a SageMaker Runtime client helper and a static demo page. Training, inference and dashboard integration are not connected. Daily category forecasts alone cannot identify the busiest hourly service window.

## 13. Implementation status

The code includes the main AI, knowledge and voice integrations, but this presentation does not claim live AWS tests were run. Guardrails depend on configuration. Forecasting remains planned. CloudWatch and Secrets Manager appear only as client factories with no connected usage found in the scanned application. The separate MCP prototype is not part of the main Bedrock tool path. Local runtime configuration does not establish an AWS production hosting design.

## Sources

Source: CallDine repository scanned 12 September 2026. AWS icons: https://aws.amazon.com/architecture/icons/ . AWS logo: https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png . Next.js logo: https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png . FastAPI icon: https://github.com/fastapi/fastapi/blob/master/docs/en/docs/img/icon-white.svg . CallDine logo: Frontend/components/ui/Logo.tsx. Brand colors: Frontend/app/globals.css. SQLite logo: https://sqlite.org/images/sqlite370_banner.gif . Qdrant logo: https://github.com/qdrant/qdrant/blob/master/docs/logo.svg . Docker logo: https://www.docker.com/company/newsroom/media-resources/ .
