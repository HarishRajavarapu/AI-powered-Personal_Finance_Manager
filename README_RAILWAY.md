# Deploying the backend to Railway (container image)

This project contains a `Dockerfile` at `backend/Dockerfile` and a GitHub Actions workflow that builds and pushes the image to GitHub Container Registry (GHCR) when you push to `main`.

Steps to deploy on Railway (recommended):

1. Push this repo to GitHub and ensure the `push-image` workflow runs and successfully publishes `ghcr.io/<owner>/<repo>:latest`.

2. Create a new Railway project and choose "Deploy from Container Image" (or create a new service and choose container).

3. Use the image URL produced by the workflow: `ghcr.io/<owner>/<repo>:latest`.

4. Set the following environment variables in Railway (Environment / Variables):

- `MONGODB_URI` — your MongoDB connection string (URL-encode the password, no surrounding quotes)
- `MONGODB_DB_NAME` — optional (default `finance_manager`)
- `JWT_SECRET_KEY` — a long random secret
- `MONGODB_TLS_ALLOW_INVALID_CERTS` — `true` or `false` (only for short-term debugging)
- `GEMINI_API_KEY` — optional

5. Deploy the service. Railway will set a `PORT` environment variable; the Dockerfile respects `$PORT`.

6. Verify the service by calling the health endpoints (replace domain with Railway service URL):

```
curl https://<your-railway-app>.up.railway.app/api/v1/health
curl https://<your-railway-app>.up.railway.app/api/v1/health/database
```

Security note: rotate the MongoDB Atlas user credentials immediately if they were exposed. After rotating, update `MONGODB_URI` in Railway.

If you want, I can also set up a GitHub Actions step to call the admin reconnect endpoint after deployment, or help with rotating Atlas credentials.
