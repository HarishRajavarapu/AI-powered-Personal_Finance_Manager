from pydantic import BaseModel, EmailStr, Field

from app.schemas.auth import UserPublic


class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr


class ProfileResponse(BaseModel):
    user: UserPublic

