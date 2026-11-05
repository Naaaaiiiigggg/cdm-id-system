from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config
from app.routers import auth_login, me, media, requests, students

app = FastAPI(
    title="CdM Student ID API",
    version="1.0.0",
    description="Issuance and replacement of student IDs. Uses Firebase Authentication tokens "
                "and Cloud Firestore. Click Authorize and sign in with your email and password.",
)

app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_login.router)
app.include_router(me.router)
app.include_router(students.router)
app.include_router(media.router)
app.include_router(requests.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "CdM Student ID API is running", "docs": "/docs"}
