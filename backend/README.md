# Backend setup
## Prerequisites
Python 3.11+ and Docker Desktop.
## 1) Start PostgreSQL with pgvector
From repo root:
`docker compose -f infra/docker-compose.yml up -d`
## 2) Configure backend environment
From `backend/`:
Copy `.env.example` to `.env` and fill integration keys.
## 3) Install dependencies
From `backend/`:
`pip install -r requirements.txt`
## 4) Apply database migration
From `backend/`:
`alembic upgrade head`
## 5) Run API
From `backend/`:
`uvicorn app.main:app --reload --port 8000`
## 6) Smoke test
- `GET /` for service metadata
- `GET /api/v1/health` for liveness
- `GET /api/v1/ready` for database readiness
