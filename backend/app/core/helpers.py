from datetime import datetime

from .firebase import SERVER_TIMESTAMP, db


def clean(data: dict) -> dict:
    """Make a Firestore document JSON friendly (timestamps -> ISO text)."""
    return {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in data.items()}


def audit(user: dict, action: str, target: str) -> None:
    db.collection("audit_logs").add({
        "action": action, "target": target, "by": user["uid"],
        "byEmail": user.get("email"), "createdAt": SERVER_TIMESTAMP,
    })
