# CallDine

CallDine is a restaurant assistant with customer chat, delivery orders, table reservations, menu management, and a restaurant knowledge base.

## Architecture

- `Frontend/` — Next.js customer and admin interface on port `3000`.
- `backend/` — FastAPI and SQLite API on port `8000`.
- Qdrant — Docker vector database for restaurant knowledge on port `6333`.

The customer assistant uses Amazon Bedrock GPT-OSS for responses and Titan Text Embeddings V2 for knowledge search. PDFs are stored in S3, read by Textract, and indexed in Qdrant. CloudWatch monitors the AWS services. Polly is configured for the future voice-response path.

## Start locally

```bash
docker compose up -d
cd backend
venv\Scripts\uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd Frontend
npm run dev
```

Open `http://localhost:3000`.

## Docker

Docker Compose intentionally runs Qdrant only. The `qdrant_storage` volume keeps restaurant embeddings between restarts. Use `http://localhost:6333/dashboard` to inspect Qdrant locally.

## Configuration

Copy `backend/.env.example` to `backend/.env` and set AWS credentials, `AWS_REGION`, S3 settings, Qdrant URL, and collection name. Never commit `.env` files or AWS keys.

## Checks

```bash
cd backend
venv\Scripts\python -m compileall app

cd ..\Frontend
npm run typecheck
npm run lint
npm run build
```
