from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.db.database import Base, engine
from app.models.user import User
from app.models.admin import Admin
from app.models.task import Task
from app.api import user, admin, admin_panel, task


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(admin.router)
app.include_router(admin_panel.router)
app.include_router(task.router)

Base.metadata.create_all(bind=engine)

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
INDEX_HTML = FRONTEND_DIST / "index.html"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"


@app.get("/")
def root():
    if INDEX_HTML.exists():
        return HTMLResponse(INDEX_HTML.read_text(encoding="utf-8"))
    return HTMLResponse(
        """
        <!doctype html>
        <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Task Manager</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; max-width: 760px; }
            a { display: inline-block; margin-right: 12px; }
          </style>
        </head>
        <body>
          <h1>Task Manager API</h1>
          <p>Build the frontend (<code>cd frontend && npm run build</code>) to serve the web app here.</p>
          <a href="/admin-panel">Open Admin Panel</a>
          <a href="/docs">Open API Docs</a>
        </body>
        </html>
        """
    )


@app.get("/favicon.svg")
def favicon():
    path = FRONTEND_DIST / "favicon.svg"
    if path.exists():
        return FileResponse(path)
    raise HTTPException(status_code=404)


if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS)), name="assets")