import base64
import hashlib
import hmac
import os
import time

from fastapi import Cookie, HTTPException
from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.db.deps import get_db
from fastapi import Depends


COOKIE_NAME = "admin_session"
TOKEN_TTL_SECONDS = 60 * 60 * 8


def _is_truthy(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


def should_use_secure_cookie() -> bool:
    cookie_secure = os.getenv("COOKIE_SECURE")
    if cookie_secure is not None:
        return _is_truthy(cookie_secure)

    env = (os.getenv("ENVIRONMENT") or "development").strip().lower()
    return env in {"production", "staging"}


def _get_secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if not key:
        raise RuntimeError("SECRET_KEY is not set. Add SECRET_KEY to your .env file.")
    return key


def create_admin_token(admin_id: int) -> str:
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{admin_id}:{expires_at}"
    signature = hmac.new(
        _get_secret_key().encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    token_raw = f"{payload}:{signature}"
    return base64.urlsafe_b64encode(token_raw.encode("utf-8")).decode("utf-8")


def _decode_token(token: str) -> tuple[int, int, str]:
    decoded = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
    admin_id_str, expires_at_str, signature = decoded.split(":")
    return int(admin_id_str), int(expires_at_str), signature


def verify_admin_token(token: str) -> int:
    try:
        admin_id, expires_at, signature = _decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid admin session")

    if int(time.time()) > expires_at:
        raise HTTPException(status_code=401, detail="Admin session expired")

    payload = f"{admin_id}:{expires_at}"
    expected_signature = hmac.new(
        _get_secret_key().encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid admin session")

    return admin_id


def get_current_admin(
    admin_session: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
) -> Admin:
    if not admin_session:
        raise HTTPException(status_code=401, detail="Admin login required")

    admin_id = verify_admin_token(admin_session)
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

