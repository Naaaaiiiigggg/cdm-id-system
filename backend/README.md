# CdM Student ID API (FastAPI + Firebase)

A Python API that uses **Firebase Authentication** (Bearer tokens) and **Cloud Firestore**.
It works on the same Firebase project as the mobile app, so both see the same data.

## Setup
```
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows PowerShell
pip install -r requirements.txt
```
Put your Firebase service account key at `backend/serviceAccountKey.json`
(Firebase console > Project settings > Service accounts > Generate new private key). **Never commit it.**

## Run
```
uvicorn main:app --reload
```
Open http://localhost:8000/docs for the Swagger page.

## Endpoints
| Method | Path | Who |
|---|---|---|
| GET | `/api/v1/me` | any signed-in user |
| POST / GET | `/api/v1/registrar-students` | admin |
| GET / PATCH / DELETE | `/api/v1/registrar-students/{studentNo}` | admin |
| POST | `/api/v1/requests` | student (own) or admin (give `studentNo`) |
| GET | `/api/v1/requests` | admin = all, student = own (`?status=`) |
| GET | `/api/v1/requests/{requestNo}` | admin or the owner |
| PATCH | `/api/v1/requests/{requestNo}` | admin (changes status, alerts the student) |
| DELETE | `/api/v1/requests/{requestNo}` | admin |

No token or a bad token returns **401**. A signed-in user without the right role gets **403**.

## Testing with Postman
1. Import `postman/CdM-Student-ID-API.postman_collection.json`.
2. In the collection's Variables, set `email` and `password` to your admin login.
3. Run **0. Login** first (it saves the token), then any other request.
