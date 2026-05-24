from fastapi import HTTPException, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import get_database
from app.models.collections import USERS_COLLECTION
from app.schemas.auth import SignupRequest
from app.utils.datetime import utc_now
from app.utils.mongo import object_id, serialize_document
from app.utils.security import hash_password


def public_user(user: dict) -> dict:
    serialized = serialize_document(user)
    return {
        "id": serialized["id"],
        "name": serialized["name"],
        "email": serialized["email"],
    }


async def get_user_by_email(email: str) -> dict | None:
    database = get_database()
    return await database[USERS_COLLECTION].find_one({"email": email.lower()})


async def get_user_by_id(user_id: str) -> dict | None:
    database = get_database()
    try:
        return await database[USERS_COLLECTION].find_one({"_id": object_id(user_id)})
    except ValueError:
        return None


async def create_user(payload: SignupRequest) -> dict:
    database = get_database()
    now = utc_now()
    document = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await database[USERS_COLLECTION].insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from exc

    document["_id"] = result.inserted_id
    return document


async def update_user(user_id: str, name: str, email: str) -> dict:
    database = get_database()
    update = {
        "$set": {
            "name": name.strip(),
            "email": email.lower(),
            "updated_at": utc_now(),
        }
    }

    try:
        updated = await database[USERS_COLLECTION].find_one_and_update(
            {"_id": object_id(user_id)},
            update,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another account is already using this email.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id.") from exc

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return updated
