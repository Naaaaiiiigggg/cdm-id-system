"""ID requests (collection 'requests'). Students see and create their own; admins manage all."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core.firebase import SERVER_TIMESTAMP, db
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


@router.patch("/{request_no}", summary="Change a request's status (admin) and alert the student")
def update_status(request_no: str, payload: RequestStatusUpdate, admin: dict = Depends(require_admin)):
    ref = db.collection(COL).document(request_no)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    current = snap.to_dict()
    ref.update({"status": payload.status, "updatedAt": SERVER_TIMESTAMP})
    db.collection("notifications").add({
        "uid": current["uid"], "requestNo": request_no, "createdAt": SERVER_TIMESTAMP,
        "message": f"Your ID request {request_no} is now: {payload.status}.",
    })
    audit(admin, f"set_status:{payload.status}", request_no)
    return {"message": "Status updated", "data": {"id": request_no, **clean(ref.get().to_dict())}}


@router.delete("/{request_no}", summary="Delete a request (admin)")
def delete_request(request_no: str, admin: dict = Depends(require_admin)):
    ref = db.collection(COL).document(request_no)
    if not ref.get().exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    ref.delete()
    audit(admin, "delete_request", request_no)
    return {"message": "Request deleted"}
