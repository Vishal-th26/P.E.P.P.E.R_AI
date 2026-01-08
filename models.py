from pydantic import BaseModel , Field
from typing import List, Optional
from uuid import UUID



class UserCreate(BaseModel):
    username: str
    password: str


class AuthRequest(BaseModel):
    username: str
    password: str

class MissingPersonCreate(BaseModel):
    name: str = Field(..., example="Vishal Thakur")

    min_age: int = Field(..., example=18)
    max_age: int = Field(..., example=25)

    last_seen_location: Optional[str] = Field(
        None, example="Hazratganj, Lucknow"
    )

    emergency_contact: Optional[str] = Field(
        None, example="+91969696969"
    )

    gender: Optional[str] = Field(
        None, example="male"
    )

    consent_given: bool = Field(..., example=True)

    class Config:
        from_attributes = True

class MissingPersonResponse(BaseModel):
    missing_person_id: UUID
    images_processed: int
    status: str = "success"



class Matchresult(BaseModel):
    missing_person_id: UUID
    name: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    location: Optional[str] = None
    reference_image: Optional[str] = None
    confidence: float


class Matchresponse(BaseModel):
    status : str = 'success'
    adaptive_threshold : float
    matches : List[Matchresult]

class Authoritydecision(BaseModel):
    missing_person_id: UUID
    decision: str