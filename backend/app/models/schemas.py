from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

from ..core import config

Program = Literal[tuple(config.PROGRAMS)]
YearLevel = Literal[tuple(config.YEAR_LEVELS)]
Status = Literal[tuple(config.STATUSES)]
RequestType = Literal[tuple(config.REQUEST_TYPES)]

STUDENT_NO = r"^\d{2}-\d{5}$"
BIRTHDATE = r"^\d{4}-\d{2}-\d{2}$"


def _real_date(v: Optional[str]) -> Optional[str]:
    """The text must be a real calendar date (so 1961-09-59 is rejected) and not in the future."""
    if v is None:
        return v
    try:
        d = date.fromisoformat(v)
    except ValueError:
        raise ValueError("birthdate must be a real date in YYYY-MM-DD format")
    if d > date.today():
        raise ValueError("birthdate cannot be in the future")
    return v


class StudentCreate(BaseModel):
    studentNo: str = Field(..., pattern=STUDENT_NO, examples=["24-66298"])
    name: str = Field(..., min_length=2, examples=["Jose Reyes"])
    program: Program = Field(..., examples=["BSCPE"])
    yearLevel: YearLevel = Field(..., examples=["3rd Year"])
    birthdate: str = Field(..., pattern=BIRTHDATE, examples=["2004-07-02"])

    _check_birthdate = field_validator("birthdate")(_real_date)


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    program: Optional[Program] = None
    yearLevel: Optional[YearLevel] = None
    birthdate: Optional[str] = Field(None, pattern=BIRTHDATE)

    _check_birthdate = field_validator("birthdate")(_real_date)


class RequestCreate(BaseModel):
    type: RequestType = Field(..., examples=["New ID"])
    studentNo: Optional[str] = Field(None, pattern=STUDENT_NO, description="Admins only: the student this request is for")


class RequestStatusUpdate(BaseModel):
    status: Status = Field(..., examples=["Under Review"])