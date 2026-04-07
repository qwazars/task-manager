from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse


router = APIRouter(tags=["admin-panel"])


@router.get("/admin-panel")
def admin_panel():
    frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": "Frontend is not built yet. Run: cd frontend && npm run build"
    }

