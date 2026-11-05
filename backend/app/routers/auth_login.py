"""Convenience login for Swagger / Postman: exchanges email + password for a Firebase ID token.
(The mobile app signs in with Firebase directly and never uses this route.)"""
import json
import urllib.error
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..core import config

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="


def _firebase_sign_in(email: str, password: str) -> dict:
    body = json.dumps({"email": email, "password": password, "returnSecureToken": True}).encode()
    req = urllib.request.Request(URL + config.FIREBASE_WEB_API_KEY, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e).get("error", {}).get("message", "")
        except Exception:
            msg = ""
        if any(k in msg for k in ("INVALID_LOGIN_CREDENTIALS", "EMAIL_NOT_FOUND", "INVALID_PASSWORD", "INVALID_EMAIL")):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
        if "TOO_MANY_ATTEMPTS" in msg:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Wait a few minutes and try again.")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Firebase sign-in failed ({msg or e.code})")
    except urllib.error.URLError:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not reach Firebase. Check your internet connection.")


@router.post("/login", summary="Sign in with email and password (returns a Firebase ID token)")
def login(form: OAuth2PasswordRequestForm = Depends()):
    data = _firebase_sign_in(form.username.strip().lower(), form.password)
    return {"access_token": data["idToken"], "token_type": "bearer", "expires_in": int(data.get("expiresIn", 3600))}
