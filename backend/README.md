# CallDine backend

FastAPI API for authentication, menu management, knowledge uploads, customer conversations, delivery orders, and table reservations.

## Run

```bash
venv\Scripts\uvicorn app.main:app --reload --port 8000
```

SQLite data is stored in `calldine.db`. Startup creates tables, adds the menu stock column when needed, and seeds the restaurant tables.

## AI and AWS services

- Bedrock GPT-OSS 20B — streamed chat and tool planning.
- Titan Text Embeddings V2 — embeds knowledge and customer knowledge queries.
- S3 — private knowledge PDF storage.
- Textract — PDF text extraction.
- Qdrant — vector search, started with Docker Compose from the repository root.
- Polly — configured client for the voice-response path.
- CloudWatch — dashboard and logs configuration.

Transcribe, Chime, Secrets Manager, and SageMaker clients are configuration-only until a feature uses them.

## Conversation tools

The assistant can search knowledge and menu items, validate quantities and stock, create/confirm delivery order drafts, and check/create/confirm table reservations. Confirmation tools require `confirmed: true` and are instructed to run only after a clear customer approval.
