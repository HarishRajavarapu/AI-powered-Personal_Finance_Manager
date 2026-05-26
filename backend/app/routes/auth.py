import asyncio

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic
from app.schemas.common import APIResponse
from app.services.user_service import create_user, get_user_by_email, public_user
from app.utils.security import create_access_token, verify_password


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest) -> AuthResponse:
    user = await create_user(payload)
    token = create_access_token(str(user["_id"]))
    return AuthResponse(access_token=token, user=UserPublic(**public_user(user)))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    user = await get_user_by_email(payload.email)
    password_valid = False
    if user is not None:
        password_valid = await asyncio.to_thread(verify_password, payload.password, user["password_hash"])

    if user is None or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(str(user["_id"]))
    return AuthResponse(access_token=token, user=UserPublic(**public_user(user)))


@router.get("/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic(**public_user(current_user))


@router.post("/logout", response_model=APIResponse)
async def logout() -> APIResponse:
    return APIResponse(message="Logged out successfully.")
