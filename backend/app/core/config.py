import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # the backend/ folder
load_dotenv(BASE_DIR / ".env")

FIREBASE_KEY_PATH = BASE_DIR / os.getenv("FIREBASE_KEY_PATH", "serviceAccountKey.json")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

PROGRAMS = ["BSIT", "BSCPE", "BSEd-SCI", "BEEd-GEN", "BEEd-ECED", "BTLEd-ICT", "BSBA-HRM", "BSE"]
YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
STATUSES = ["Submitted", "Under Review", "Approved", "For Printing", "Ready for Pickup", "Claimed", "Rejected"]
REQUEST_TYPES = ["New ID", "Replacement"]

# The ONLY allowed stage changes. Keep it identical to firestore.rules (validMove) and mobile/src/data/stageRules.js.
# A request only moves forward. Rejecting is possible only before Approved. Claimed is final.
ALLOWED_TRANSITIONS = {
    "Submitted": ["Under Review", "Rejected"],
    "Under Review": ["Approved", "Rejected"],
    "Approved": ["For Printing"],
    "For Printing": ["Ready for Pickup"],
    "Ready for Pickup": ["Claimed"],
    "Claimed": [],
    "Rejected": ["Under Review"],  # reopen only
}
# From these stages on, the ID needs the Registrar photo and the student's signature.
PRINT_STAGES = ["For Printing", "Ready for Pickup", "Claimed"]

# Public Firebase web API key (the same one the mobile app uses). Needed for the /auth/login helper.
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY", "AIzaSyBFJQN3CJrOT1isXD693af5_bYbSWAa8tw")
