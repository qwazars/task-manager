from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.admin import Admin
from app.core import security, errors


def create_admin(db: Session, email: str, password: str, username: str):
    hashed_password = security.hash_password(password)

    admin = Admin(
        username=username,
        email=email,
        password=hashed_password,
    )

    try:
        db.add(admin)
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()
        raise errors.UserAlreadyExists()

    return admin


def login_admin(db: Session, email: str, password: str):
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        raise errors.InvalidCredentials()

    if not security.verify_password(password, admin.password):
        raise errors.InvalidCredentials()

    return admin
