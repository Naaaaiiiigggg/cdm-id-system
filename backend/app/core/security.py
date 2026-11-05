"""Bearer-token protection. The client signs in with Firebase Authentication and sends the
ID token as   Authorization: Bearer <token>.  We verify it with Firebase, then read the
person's role from the Firestore 'users' collection."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from .firebase import db

bearer = HTTPBearer(auto_error=False, description="Firebase ID token from a signed-in user")


def _unauthorized(detail: str):
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detail, headers={"WWW-Authenticate": "Bearer"})


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if credentials is None:
        raise _unauthorized("Missing Bearer token")
    try:
        decoded = auth.verify_id_token(credentials.credentials)  # decodes the Firebase JWT
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
