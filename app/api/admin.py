from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.schemas import admin as schemas_admin
from app.core import errors
from app.services import admin_service
from app.db.deps import get_db
from app.core.admin_auth import COOKIE_NAME, create_admin_token, should_use_secure_cookie


router = APIRouter(prefix="/admins", tags=["admins"])


@router.post("/register", response_model=schemas_admin.AdminResponse)
def register(admin: schemas_admin.AdminCreate, db: Session = Depends(get_db)):
    try:
        return admin_service.create_admin(db, admin.email, admin.password, admin.username)
    except errors.UserAlreadyExists:
        raise HTTPException(status_code=409, detail="Admin username or email already exists")


@router.post("/login", response_model=schemas_admin.AdminResponse)
def login(
    admin: schemas_admin.AdminLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        current_admin = admin_service.login_admin(db, admin.email, admin.password)
        token = create_admin_token(current_admin.id)
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            samesite="lax",
            secure=should_use_secure_cookie(),
            max_age=60 * 60 * 8,
        )
        return current_admin
    except errors.InvalidCredentials:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME)
    return {"message": "Logged out"}
