from datetime import UTC, date, datetime, time

from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.database.mongodb import get_database
from app.models.collections import TRANSACTIONS_COLLECTION
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.utils.datetime import utc_now
from app.utils.mongo import object_id, serialize_document


def serialize_transaction(document: dict) -> dict:
    serialized = serialize_document(document)
    serialized.pop("user_id", None)
    return serialized


def _date_to_datetime(value: date | None, end_of_day: bool = False) -> datetime | None:
    if value is None:
        return None
    boundary = time.max if end_of_day else time.min
    return datetime.combine(value, boundary, tzinfo=UTC)


def build_transaction_query(user_id: str, filters: dict) -> dict:
    query: dict[str, object] = {"user_id": user_id}

    if filters.get("search"):
        query["title"] = {"$regex": filters["search"], "$options": "i"}
    if filters.get("category"):
        query["category"] = filters["category"]
    if filters.get("type"):
        query["type"] = filters["type"]
    if filters.get("month"):
        query["date"] = {
            "$gte": datetime.fromisoformat(f"{filters['month']}-01T00:00:00+00:00"),
        }
        year, month = [int(part) for part in filters["month"].split("-")]
        if month == 12:
            query["date"]["$lt"] = datetime(year + 1, 1, 1, tzinfo=UTC)
        else:
            query["date"]["$lt"] = datetime(year, month + 1, 1, tzinfo=UTC)

    date_from = _date_to_datetime(filters.get("date_from"))
    date_to = _date_to_datetime(filters.get("date_to"), end_of_day=True)
    if date_from or date_to:
        query.setdefault("date", {})
        if date_from:
            query["date"]["$gte"] = date_from
        if date_to:
            query["date"]["$lte"] = date_to

    amount_min = filters.get("amount_min")
    amount_max = filters.get("amount_max")
    if amount_min is not None or amount_max is not None:
        query["amount"] = {}
        if amount_min is not None:
            query["amount"]["$gte"] = amount_min
        if amount_max is not None:
            query["amount"]["$lte"] = amount_max

    return query


async def list_transactions(user_id: str, filters: dict) -> tuple[list[dict], int]:
    database = get_database()
    query = build_transaction_query(user_id, filters)
    limit = min(filters.get("limit", 100), 500)
    skip = max(filters.get("skip", 0), 0)

    cursor = (
        database[TRANSACTIONS_COLLECTION]
        .find(query)
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
    )
    documents = await cursor.to_list(length=limit)
    total = await database[TRANSACTIONS_COLLECTION].count_documents(query)
    return [serialize_transaction(document) for document in documents], total


async def create_transaction(user_id: str, payload: TransactionCreate) -> dict:
    database = get_database()
    now = utc_now()
    document = {
        **payload.model_dump(),
        "category": payload.category.value,
        "type": payload.type.value,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
    }
    result = await database[TRANSACTIONS_COLLECTION].insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_transaction(document)


async def update_transaction(user_id: str, transaction_id: str, payload: TransactionUpdate) -> dict:
    database = get_database()
    try:
        updated = await database[TRANSACTIONS_COLLECTION].find_one_and_update(
            {"_id": object_id(transaction_id), "user_id": user_id},
            {
                "$set": {
                    **payload.model_dump(),
                    "category": payload.category.value,
                    "type": payload.type.value,
                    "updated_at": utc_now(),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid transaction id.") from exc

    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return serialize_transaction(updated)


async def delete_transaction(user_id: str, transaction_id: str) -> None:
    database = get_database()
    try:
        result = await database[TRANSACTIONS_COLLECTION].delete_one(
            {"_id": object_id(transaction_id), "user_id": user_id}
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid transaction id.") from exc

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
