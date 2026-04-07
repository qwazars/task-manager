# Task Manager

Simple full-stack Task Manager application with:
- FastAPI backend
- PostgreSQL database
- React + Vite frontend

## Features

- User registration and login
- Admin registration and login
- Admin-only user management endpoints
- CRUD operations for tasks
- Frontend served from FastAPI after build
- OpenAPI docs at `/docs`

## Tech Stack

- Backend: FastAPI, SQLAlchemy
- Database: PostgreSQL (Docker Compose)
- Frontend: React, Vite

## Project Structure

```text
app/
  api/        # FastAPI route handlers
  core/       # auth/error utilities
  db/         # database engine + session dependency
  models/     # SQLAlchemy models
  schemas/    # Pydantic schemas
  services/   # business logic
  main.py     # app entrypoint
frontend/     # React app
docker-compose.yml
```

## Local Setup

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd task_manager
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and update values:

```env
DATABASE_URL=postgresql://user:your_password@localhost:5432/task_db
SECRET_KEY=use_a_long_random_secret
ENVIRONMENT=development
# Optional override:
COOKIE_SECURE=false
```

Generate a strong secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3) Start PostgreSQL

```bash
docker compose up -d
```

### 4) Install backend dependencies

Create a virtual environment and install required packages (example):

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

### 5) Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs on `http://127.0.0.1:8000`.

### 6) Run frontend (optional for local dev)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`.

## Build Frontend for FastAPI Serving

```bash
cd frontend
npm run build
```

After build, FastAPI serves compiled frontend assets from `frontend/dist`.

## API Docs

- Swagger UI: `http://127.0.0.1:8000/docs`

## Security Notes

- Do not commit `.env` to GitHub.
- Use a strong `SECRET_KEY`.
- Rotate credentials if secrets were ever committed publicly.
- Admin cookie `secure` is now env-driven:
  - `ENVIRONMENT=production` or `staging` -> secure cookie on
  - local/dev defaults to off
  - override with `COOKIE_SECURE=true|false`

## License

Add your preferred license (MIT, Apache-2.0, etc.) before publishing.
