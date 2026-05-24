from datetime import UTC, datetime

from app.database.mongodb import get_database
from app.models.collections import TRANSACTIONS_COLLECTION
from app.services.budget_service import list_budgets, month_bounds
from app.services.transaction_service import serialize_transaction
from app.utils.datetime import month_key, utc_now


def recent_month_keys(count: int = 6) -> list[str]:
    today = utc_now()
    year = today.year
    month = today.month
    keys: list[str] = []

    for _ in range(count):
        keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1

    return list(reversed(keys))


async def month_totals(user_id: str, months: list[str]) -> list[dict]:
    database = get_database()
    points: list[dict] = []

    for month in months:
        start, end = month_bounds(month)
        pipeline = [
            {"$match": {"user_id": user_id, "date": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": "$type", "amount": {"$sum": "$amount"}}},
        ]
        rows = await database[TRANSACTIONS_COLLECTION].aggregate(pipeline).to_list(length=10)
        income = sum(float(row["amount"]) for row in rows if row["_id"] == "income")
        expenses = sum(float(row["amount"]) for row in rows if row["_id"] == "expense")
        points.append(
            {
                "month": month,
                "income": income,
                "expenses": expenses,
                "savings": income - expenses,
            }
        )

    return points


async def total_by_type(user_id: str, transaction_type: str | None = None) -> float:
    database = get_database()
    query = {"user_id": user_id}
    if transaction_type:
        query["type"] = transaction_type
    pipeline = [{"$match": query}, {"$group": {"_id": None, "amount": {"$sum": "$amount"}}}]
    rows = await database[TRANSACTIONS_COLLECTION].aggregate(pipeline).to_list(length=1)
    return float(rows[0]["amount"]) if rows else 0.0


async def current_month_summary(user_id: str) -> dict:
    current_month = month_key()
    current = (await month_totals(user_id, [current_month]))[0]
    all_income = await total_by_type(user_id, "income")
    all_expenses = await total_by_type(user_id, "expense")
    return {
        "total_balance": all_income - all_expenses,
        "total_income": current["income"],
        "total_expenses": current["expenses"],
        "savings": current["savings"],
    }


async def recent_transactions(user_id: str, limit: int = 5) -> list[dict]:
    database = get_database()
    documents = (
        await database[TRANSACTIONS_COLLECTION]
        .find({"user_id": user_id})
        .sort("date", -1)
        .limit(limit)
        .to_list(length=limit)
    )
    return [serialize_transaction(document) for document in documents]


async def category_spending(user_id: str, month: str | None = None) -> list[dict]:
    database = get_database()
    query: dict[str, object] = {"user_id": user_id, "type": "expense"}
    if month:
        start, end = month_bounds(month)
        query["date"] = {"$gte": start, "$lt": end}

    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$category", "amount": {"$sum": "$amount"}}},
        {"$sort": {"amount": -1}},
    ]
    rows = await database[TRANSACTIONS_COLLECTION].aggregate(pipeline).to_list(length=50)
    return [{"category": row["_id"], "amount": float(row["amount"])} for row in rows]


async def dashboard_data(user_id: str) -> dict:
    months = recent_month_keys()
    current_month = month_key()
    budgets, _ = await list_budgets(user_id, current_month)
    return {
        "summary": await current_month_summary(user_id),
        "monthly_overview": await month_totals(user_id, months),
        "recent_transactions": await recent_transactions(user_id),
        "budget_progress": budgets,
    }


async def charts_data(user_id: str) -> dict:
    months = recent_month_keys()
    monthly = await month_totals(user_id, months)
    return {
        "category_spending": await category_spending(user_id, month_key()),
        "income_vs_expenses": monthly,
        "spending_trend": monthly,
        "savings_growth": monthly,
    }

