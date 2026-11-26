"""ID requests (collection 'requests'). Students see and create their own; admins manage all."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core import config
from ..core.firebase import DELETE_FIELD, SERVER_TIMESTAMP, db
from ..core.helpers import audit, clean
from ..core.security import get_current_user, require_admin
from ..models.schemas import RequestCreate, RequestStatusUpdate, Status

router = APIRouter(prefix="/api/v1/requests", tags=["ID requests"])
COL = "requests"


def _can_see(user: dict, data: dict) -> bool:
    return user["role"] == "admin" or data.get("uid") == user["uid"]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Submit an ID request")
def create_request(payload: RequestCreate, user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        # An admin files the request on behalf of a student who already has an account.
        if not payload.studentNo:
            raise HTTPException(422, "studentNo is required when an admin submits a request")
        reg = db.collection("registered_students").document(payload.studentNo).get()
        if not reg.exists:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "That student has not created an account yet")
        uid, student_no = reg.to_dict()["uid"], payload.studentNo
    elif user["role"] == "student":
        uid, student_no = user["uid"], user["studentNo"]
    else:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed")

    # Business rule: one active request at a time.
    for d in db.collection(COL).where("uid", "==", uid).stream():
        if d.to_dict().get("status") != "Claimed":
            raise HTTPException(status.HTTP_409_CONFLICT, f"There is already an active request ({d.id})")

    request_no = f"REQ-{datetime.now():%Y%m%d}-{uuid.uuid4().hex[:4].upper()}"
    data = {"uid": uid, "studentNo": student_no, "requestNo": request_no,
            "type": payload.type, "reason": payload.reason or "", "status": "Submitted", "createdAt": SERVER_TIMESTAMP}
    db.collection(COL).document(request_no).set(data)
    audit(user, "create_request", request_no)
    return {"message": "Request submitted", "data": clean(db.collection(COL).document(request_no).get().to_dict())}


@router.get("", summary="List requests (admin: all, student: your own)")
def list_requests(status_filter: Status | None = Query(None, alias="status"), user: dict = Depends(get_current_user)):
    q = db.collection(COL)
    if user["role"] != "admin":
        q = q.where("uid", "==", user["uid"])
    items = [{"id": d.id, **d.to_dict()} for d in q.stream()]
    if status_filter:
        items = [i for i in items if i.get("status") == status_filter]
    items.sort(key=lambda i: str(i.get("createdAt") or ""), reverse=True)
    return [clean(i) for i in items]


@router.get("/{request_no}", summary="Get one request")
def get_request(request_no: str, user: dict = Depends(get_current_user)):
    snap = db.collection(COL).document(request_no).get()
    if not snap.exists or not _can_see(user, snap.to_dict()):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    return {"id": snap.id, **clean(snap.to_dict())}


def _check_transition(current_status: str, new_status: str) -> None:
    """The same table as firestore.rules (validMove) and the app (stageRules.js)."""
    if current_status == "Claimed":
        raise HTTPException(status.HTTP_409_CONFLICT, "This request is Claimed. The ID was already handed out, so it can't be changed.")
    allowed = config.ALLOWED_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid transition: {current_status} -> {new_status}. Allowed next: {', '.join(allowed) or 'none'}.",
        )


def _check_print_ready(student_no: str) -> None:
    """From For Printing on, the ID needs the Registrar photo and the student's signature."""
    missing = []
    student = db.collection("registrar_students").document(student_no).get()
    if not (student.exists and student.to_dict().get("photo")):
        missing.append("the photo has not been uploaded")
    if not db.collection("student_signatures").document(student_no).get().exists:
        missing.append("the student has not signed yet")
    if missing:
        raise HTTPException(422, f"Can't move this request yet: {' and '.join(missing)}.")


@router.patch("/{request_no}", summary="Change a request's status (admin) and alert the student")
def update_status(request_no: str, payload: RequestStatusUpdate, admin: dict = Depends(require_admin)):
    ref = db.collection(COL).document(request_no)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    current = snap.to_dict()
    old_status, new_status = current.get("status"), payload.status
    moving = new_status != old_status

    # 1. Stage rules. Claimed is final, even for a note-only change.
    if moving or old_status == "Claimed":
        _check_transition(old_status, new_status)

    # 2. Required checks before the move.
    if moving and new_status == "Rejected" and not (payload.note or current.get("adminNote")):
        raise HTTPException(422, "Add a note that explains why the request is rejected")
    if moving and new_status in config.PRINT_STAGES:
        _check_print_ready(current["studentNo"])
    pickup_date = payload.pickupDate or current.get("pickupDate")
    if moving and new_status == "Ready for Pickup" and not pickup_date:
        raise HTTPException(422, "pickupDate is required to move to Ready for Pickup")

    changes = {"updatedAt": SERVER_TIMESTAMP}
    if moving:
        changes["status"] = new_status
        changes[f"stageDates.{new_status}"] = SERVER_TIMESTAMP
        if old_status == "Rejected":  # reopened: the old rejection date no longer applies
            changes["stageDates.Rejected"] = DELETE_FIELD
    if payload.note is not None:
        changes["adminNote"] = payload.note.strip()
    if new_status == "Ready for Pickup":
        for field in ("pickupDate", "pickupFrom", "pickupTo", "pickupBring"):
            value = getattr(payload, field)
            if value is not None:
                changes[field] = value.strip()
    if len(changes) == 1 and not moving:
        return {"message": "No changes", "data": {"id": request_no, **clean(current)}}
    ref.update(changes)

    note = changes.get("adminNote", current.get("adminNote", ""))
    if new_status == "Rejected" and moving:
        message = f"Your ID request {request_no} was rejected."
    elif moving:
        message = f"Your ID request {request_no} is now: {new_status}."
        if new_status == "Ready for Pickup":
            message += f" Pick it up on {pickup_date}."
    else:
        message = f"The Registrar left a note on your request {request_no}."
    if note:
        message += f" Note: {note}"
    db.collection("notifications").add({
        "uid": current["uid"], "requestNo": request_no, "createdAt": SERVER_TIMESTAMP, "message": message[:600],
    })
    audit(admin, f"set_status:{new_status}" if moving else "set_note", request_no)
    return {"message": "Status updated", "data": {"id": request_no, **clean(ref.get().to_dict())}}


