from sqlalchemy.orm import Session
from app.models.user import User
from app.core import security
from app.core import errors
from sqlalchemy.exc import IntegrityError

def create_user(db: Session, email: str, password: str, username: str):
    hashed_password = security.hash_password(password)

    user = User(
        username=username,
        email=email,
        password=hashed_password
    )
    print(password, type(password), len(password))
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise errors.UserAlreadyExists()

    return user
def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise errors.InvalidCredentials()
    
    if not security.verify_password(password, user.password):
        raise errors.InvalidCredentials()
    
    return user 


def list_users(db: Session):
    users = db.query(User).all()
    if not users:
        raise errors.NotFound()
    return users

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise errors.UserNotFound()
    db.delete(user)
    db.commit()
    return user