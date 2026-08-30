# CallDine backend

FastAPI foundation for the CallDine restaurant assistant.

## Run locally

```bash
cd backend
venv/bin/uvicorn app.main:app --reload --port 8000
```

The service currently provides only `GET /` and `GET /health`.

Only the base FastAPI foundation is present. API features, database access, AI,
and AWS integrations will be added when they are needed.
