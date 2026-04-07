from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import user as schemas_user
from app.services import user_service 
from app.db.deps import get_db
from app.core import errors
from fastapi import HTTPException
from app.core.admin_auth import get_current_admin
from app.models.admin import Admin

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas_user.UserResponse)
def register(user: schemas_user.UserCreate, db: Session = Depends(get_db)):
    try:
        return user_service.create_user(db, user.email, user.password, user.username)
    except errors.UserAlreadyExists:
        raise HTTPException(status_code=409, detail="Username or email already exists")

@router.post("/login", response_model=schemas_user.UserResponse)
def login(user: schemas_user.UserLogin, db: Session = Depends(get_db)):
    try:
        return user_service.login_user(db, user.email, user.password)
    except errors.InvalidCredentials:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/", response_model=list[schemas_user.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    return user_service.list_users(db)


@router.post("/admin/create", response_model=schemas_user.UserResponse)
def admin_create_user(
    user: schemas_user.UserCreate,
    db: Session = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
):
    try:
        return user_service.create_user(db, user.email, user.password, user.username)
    except errors.UserAlreadyExists:
        raise HTTPException(status_code=409, detail="Username or email already exists")

@router.delete("/{user_id}", response_model=schemas_user.UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), _admin: Admin = Depends(get_current_admin)):
    try:
        return user_service.delete_user(db, user_id)
    except errors.UserNotFound:
        raise HTTPException(status_code=404, detail="User not found")
    except errors.BadRequest:
        raise HTTPException(status_code=400, detail="Invalid user data")
    except errors.InternalServerError:
        raise HTTPException(status_code=500, detail="Internal server error")
