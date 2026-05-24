from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.user_service import public_user, update_user


router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)) -> ProfileResponse:
    return ProfileResponse(user=public_user(current_user))


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
) -> ProfileResponse:
    user = await update_user(str(current_user["_id"]), payload.name, payload.email)
    return ProfileResponse(user=public_user(user))

