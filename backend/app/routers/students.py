"""Registrar list (collection 'registrar_students'). Admin only."""
from fastapi import APIRouter, Depends, HTTPException, status
from google.api_core.exceptions import AlreadyExists

from ..core.firebase import db
from ..core.helpers import audit, clean
from ..core.security import require_admin
from ..models.schemas import StudentCreate, StudentUpdate

router = APIRouter(prefix="/api/v1/registrar-students", tags=["Registrar students"])
COL = "registrar_students"


def _public(data: dict) -> dict:
    """Student fields for API answers: the photo itself is large, so only say whether one exists."""
    data = dict(data)
    has = bool(data.pop("photo", None))
    data.pop("photoUpdatedAt", None)
    return {**clean(data), "hasPhoto": has}


def _registered(student_no: str) -> bool:
    return db.collection("registered_students").document(student_no).get().exists


@router.post("", status_code=status.HTTP_201_CREATED, summary="Add a student to the Registrar list")
def create_student(payload: StudentCreate, admin: dict = Depends(require_admin)):
    data = payload.model_dump()
    student_no = data.pop("studentNo")
    try:
        db.collection(COL).document(student_no).create(data)
    except AlreadyExists:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Student {student_no} already exists")
    audit(admin, "create_registrar_student", student_no)
    return {"message": "Student added", "data": {"studentNo": student_no, **data}}


@router.get("", summary="List all students")
def list_students(admin: dict = Depends(require_admin)):
    registered = {d.id for d in db.collection("registered_students").stream()}
    # select(): download only the text fields, not the photos
    fields = ["name", "program", "yearLevel", "birthdate", "contact", "address", "guardian", "guardianContact"]
    out = [{"studentNo": d.id, **clean(d.to_dict()), "registered": d.id in registered}
           for d in db.collection(COL).select(fields).stream()]
    return sorted(out, key=lambda s: s.get("name", ""))


@router.get("/{student_no}", summary="Get one student")
def get_student(student_no: str, admin: dict = Depends(require_admin)):
    snap = db.collection(COL).document(student_no).get()
    if not snap.exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    return {"studentNo": student_no, **_public(snap.to_dict()), "registered": _registered(student_no)}


@router.patch("/{student_no}", summary="Update some fields of a student")
def update_student(student_no: str, payload: StudentUpdate, admin: dict = Depends(require_admin)):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Send at least one field to update")
    ref = db.collection(COL).document(student_no)
    if not ref.get().exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    ref.update(changes)
    audit(admin, "update_registrar_student", student_no)
    return {"message": "Student updated", "data": {"studentNo": student_no, **_public(ref.get().to_dict())}}


@router.delete("/{student_no}", summary="Remove a student (only if they have no account yet)")
def delete_student(student_no: str, admin: dict = Depends(require_admin)):
    ref = db.collection(COL).document(student_no)
    if not ref.get().exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    if _registered(student_no):
        raise HTTPException(status.HTTP_409_CONFLICT, "This student already has an account. Suspend the account instead.")
    ref.delete()
    audit(admin, "delete_registrar_student", student_no)
    return {"message": "Student deleted"}
