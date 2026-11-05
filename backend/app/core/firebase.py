"""Connects Python to Firebase with the service account key (one shared client)."""
import firebase_admin
from firebase_admin import credentials, firestore

from . import config

if not config.FIREBASE_KEY_PATH.exists():
    raise RuntimeError(
        f"Firebase key not found at {config.FIREBASE_KEY_PATH}. "
        "Download it from Firebase console > Project settings > Service accounts > "
        "Generate new private key, and save it as backend/serviceAccountKey.json"
    )

if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(str(config.FIREBASE_KEY_PATH)))

db = firestore.client()
SERVER_TIMESTAMP = firestore.SERVER_TIMESTAMP
