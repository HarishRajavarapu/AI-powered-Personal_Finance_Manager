# Backend Setup

FastAPI backend for the AI-Powered Personal Finance Manager.

## Local setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env` with your MongoDB Atlas URI and JWT secret.

## Run the API

```bash
uvicorn app.main:app --reload
```

The API will run at `http://127.0.0.1:8000`.

Health endpoints:

- `GET /`
- `GET /api/v1/health`
- `GET /api/v1/health/database`

