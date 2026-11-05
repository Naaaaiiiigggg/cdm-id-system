"""Bearer-token protection. The client signs in with Firebase Authentication and sends the
ID token as   Authorization: Bearer <token>.  We verify it with Firebase, then read the
person's role from the Firestore 'users' collection."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth

from .firebase import db

# In Swagger, Authorize asks for email + password and gets the token from /api/v1/auth/login.
# Postman and other clients can still send:  Authorization: Bearer <Firebase ID token>
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False, description="Sign in with your email and password")


def _unauthorized(detail: str):
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detail, headers={"WWW-Authenticate": "Bearer"})


def get_current_user(token: str | None = Depends(oauth2)) -> dict:
    if not token:
        raise _unauthorized("Missing Bearer token")
    try:
        decoded = auth.verify_id_token(token)  # decodes the Firebase JWT
    except Exception:
        raise _unauthorized("Invalid or expired Bearer token")

    snap = db.collection("users").document(decoded["uid"]).get()
    if not snap.exists:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has no profile. Please contact the Registrar.")
    profile = snap.to_dict()
    if profile.get("status") != "Active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account suspended. Please contact the Registrar.")
    return {
        "uid": decoded["uid"],
        "email": decoded.get("email") or profile.get("email"),
        "role": profile.get("role"),
        "studentNo": profile.get("studentNo"),
        "name": profile.get("name"),
        "staffId": profile.get("staffId"),
    }


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user
