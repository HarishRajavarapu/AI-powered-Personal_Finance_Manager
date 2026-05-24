# AI-Powered Personal Finance Manager

Production-ready full-stack personal finance app with React, FastAPI, MongoDB Atlas, JWT authentication, budgeting, analytics, exports, and Gemini-powered insights.

## Tech Stack

- Frontend: React + Vite, Tailwind CSS, ShadCN-style UI, React Router, Axios, Recharts, Framer Motion, React Hook Form, Zod, Lucide icons
- Backend: FastAPI, Motor, MongoDB Atlas, JWT, bcrypt, Pydantic, python-dotenv, CORS
- Deployment: Netlify frontend, Render backend

## Project Structure

```text
backend/
  app/
    config/
    database/
    middleware/
    models/
    routes/
    schemas/
    services/
    utils/

frontend/
  src/
    components/
    context/
    hooks/
    layouts/
    pages/
    services/
    utils/
```

## MongoDB Collections

`users`

- `name`
- `email` unique
- `password_hash`
- `created_at`
- `updated_at`

`transactions`

- `user_id`
- `title`
- `amount`
- `category`
- `type`: `income` or `expense`
- `date`
- `notes`
- `created_at`
- `updated_at`

`budgets`

- `user_id`
- `month`: `YYYY-MM`
- `category`
- `limit_amount`
- `alert_threshold`
- `created_at`
- `updated_at`

## Backend Setup

```bash
cd D:\codex\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env`:

```env
MONGODB_URI="your-mongodb-atlas-uri"
JWT_SECRET_KEY="a-long-random-secret"
GEMINI_API_KEY="optional-gemini-api-key"
```

Run:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

## Frontend Setup

```bash
cd D:\codex\frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## API Routes

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/profile`
- `PATCH /api/v1/profile`
- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `PUT /api/v1/transactions/{transaction_id}`
- `DELETE /api/v1/transactions/{transaction_id}`
- `GET /api/v1/budgets`
- `POST /api/v1/budgets`
- `PUT /api/v1/budgets/{budget_id}`
- `DELETE /api/v1/budgets/{budget_id}`
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/charts`
- `GET /api/v1/insights`

## Deployment

Frontend deploys with `netlify.toml`.

Backend deploys with `render.yaml`.

Set these Render environment variables:

- `MONGODB_URI`
- `JWT_SECRET_KEY`
- `GEMINI_API_KEY`
- `CORS_ORIGINS` with your Netlify URL

## Verification

```bash
cd D:\codex\backend
python -m compileall app

cd D:\codex\frontend
npm run lint
npm run build
```

