"""Student photo for the ID card (admin only) and signature reset.

The Registrar uploads the photo here. The API crops and shrinks it to a small JPEG and stores
it as a field ('photo') on the student's own registrar_students document, so no paid file
storage and no extra collection are needed. The student's app reads it to preview the ID.

The signature is NOT uploaded: the student draws it in the app (saved once in the
'student_signatures' collection). The Registrar can only check or reset it here."""
import base64
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

from ..core.firebase import DELETE_FIELD, SERVER_TIMESTAMP, db
from ..core.helpers import audit
from ..core.security import require_admin

router = APIRouter(prefix="/api/v1/registrar-students", tags=["Student photo & signature"])

MAX_UPLOAD = 5 * 1024 * 1024        # 5 MB original file
MAX_STORED = 700_000                # characters; a Firestore document must stay under 1 MB
ALLOWED = {"image/jpeg", "image/png", "image/webp"}


def _student_exists(student_no: str) -> None:
    if not db.collection("registrar_students").document(student_no).get().exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")


def _open(upload: UploadFile, raw: bytes) -> Image.Image:
    if upload.content_type not in ALLOWED:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Upload a JPG, PNG or WEBP image")
    if len(raw) > MAX_UPLOAD:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image is larger than 5 MB")
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "That file is not a valid image")
    img = ImageOps.exif_transpose(img)       # respect the phone camera's rotation
    if img.mode in ("RGBA", "LA", "P"):      # put transparent images on white
        img = img.convert("RGBA")
        white = Image.new("RGBA", img.size, "white")
        img = Image.alpha_composite(white, img)
    return img.convert("RGB")


def _data_uri(img: Image.Image, quality: int) -> str:
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=quality, optimize=True)
    uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    if len(uri) > MAX_STORED:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image is still too large after resizing")
    return uri


def _save_photo(student_no: str, uri: str) -> None:
    db.collection("registrar_students").document(student_no).update({"photo": uri, "photoUpdatedAt": SERVER_TIMESTAMP})


@router.put("/{student_no}/photo", summary="Upload the student's ID photo")
def upload_photo(student_no: str, file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    _student_exists(student_no)
    img = _open(file, file.file.read())
    img = ImageOps.fit(img, (320, 400), method=Image.LANCZOS, centering=(0.5, 0.35))  # 4:5 portrait crop
    _save_photo(student_no, _data_uri(img, 82))
    audit(admin, "upload_photo", student_no)
    return {"message": "Photo saved", "studentNo": student_no}


@router.get("/{student_no}/media", summary="Does this student have a photo and a signature?")
def media_status(student_no: str, admin: dict = Depends(require_admin)):
    _student_exists(student_no)
    student = db.collection("registrar_students").document(student_no).get().to_dict()
    sig = db.collection("student_signatures").document(student_no).get()
    return {
        "studentNo": student_no,
        "hasPhoto": bool(student.get("photo")),
        "hasSignature": sig.exists,
    }


@router.delete("/{student_no}/photo", summary="Remove the student's photo")
def delete_photo(student_no: str, admin: dict = Depends(require_admin)):
    _student_exists(student_no)
    db.collection("registrar_students").document(student_no).update({"photo": DELETE_FIELD, "photoUpdatedAt": DELETE_FIELD})
    audit(admin, "delete_photo", student_no)
    return {"message": "Photo removed"}


@router.delete("/{student_no}/signature", summary="Reset the student's signature so they can draw it again")
def reset_signature(student_no: str, admin: dict = Depends(require_admin)):
    _student_exists(student_no)
    db.collection("student_signatures").document(student_no).delete()
    audit(admin, "reset_signature", student_no)
    return {"message": "Signature reset. The student can draw a new one in the app."}
