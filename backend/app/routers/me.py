from fastapi import APIRouter, Depends

from ..core.firebase import db
from ..core.helpers import clean
from ..core.security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Me"])


@router.get("/me", summary="Who am I? (needs a valid token)")
def me(user: dict = Depends(get_current_user)):
    out = dict(user)
    if user["role"] == "student" and user["studentNo"]:
        snap = db.collection("registrar_students").document(user["studentNo"]).get()
        if snap.exists:
            out["registrar"] = clean(snap.to_dict())
    return out
