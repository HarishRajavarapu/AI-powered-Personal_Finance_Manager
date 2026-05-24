from datetime import UTC, datetime

from fastapi import HTTPException, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import get_database
from app.models.collections import BUDGETS_COLLECTION, TRANSACTIONS_COLLECTION
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.utils.datetime import utc_now
from app.utils.mongo import object_id, serialize_document


def month_bounds(month: str) -> tuple[datetime, datetime]:
    year, month_number = [int(part) for part in month.split("-")]
    start = datetime(year, month_number, 1, tzinfo=UTC)
    if month_number == 12:
        end = datetime(year + 1, 1, 1, tzinfo=UTC)
    else:
        end = datetime(year, month_number + 1, 1, tzinfo=UTC)
    return start, end


async def spending_for_category(user_id: str, month: str, category: str) -> float:
    database = get_database()
    start, end = month_bounds(month)
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "type": "expense",
                "category": category,
                "date": {"$gte": start, "$lt": end},
            }
        },
        {"$group": {"_id": None, "amount": {"$sum": "$amount"}}},
    ]
    rows = await database[TRANSACTIONS_COLLECTION].aggregate(pipeline).to_list(length=1)
    return float(rows[0]["amount"]) if rows else 0.0


async def serialize_budget(user_id: str, document: dict) -> dict:
    serialized = serialize_document(document)
    spent = await spending_for_category(user_id, serialized["month"], serialized["category"])
    limit_amount = float(serialized["limit_amount"])
    progress = min(round((spent / limit_amount) * 100, 2), 999) if limit_amount else 0
    serialized["spent"] = spent
    serialized["remaining"] = max(limit_amount - spent, 0)
    serialized["progress"] = progress
    serialized["is_over_budget"] = spent > limit_amount
    serialized.pop("user_id", None)
    return serialized


async def list_budgets(user_id: str, month: str | None = None) -> tuple[list[dict], int]:
    database = get_database()
    query = {"user_id": user_id}
    if month:
        query["month"] = month

    documents = await database[BUDGETS_COLLECTION].find(query).sort("category", 1).to_list(length=200)
    budgets = [await serialize_budget(user_id, document) for document in documents]
    return budgets, len(budgets)


async def create_budget(user_id: str, payload: BudgetCreate) -> dict:
    database = get_database()
    now = utc_now()
    document = {
        **payload.model_dump(),
        "category": payload.category.value,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await database[BUDGETS_COLLECTION].insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget for this category and month already exists.",
        ) from exc

    document["_id"] = result.inserted_id
    return await serialize_budget(user_id, document)


async def update_budget(user_id: str, budget_id: str, payload: BudgetUpdate) -> dict:
    database = get_database()
    try:
        updated = await database[BUDGETS_COLLECTION].find_one_and_update(
            {"_id": object_id(budget_id), "user_id": user_id},
            {
                "$set": {
                    **payload.model_dump(),
                    "category": payload.category.value,
                    "updated_at": utc_now(),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget for this category and month already exists.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid budget id.") from exc

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    return await serialize_budget(user_id, updated)


async def delete_budget(user_id: str, budget_id: str) -> None:
    database = get_database()
    try:
        result = await database[BUDGETS_COLLECTION].delete_one(
            {"_id": object_id(budget_id), "user_id": user_id}
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid budget id.") from exc

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
