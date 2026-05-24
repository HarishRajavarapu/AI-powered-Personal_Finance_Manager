from datetime import date

from fastapi import APIRouter, Depends, Query, status

from app.middleware.auth import get_current_user
from app.schemas.common import APIResponse
from app.schemas.transaction import (
    TransactionCategory,
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
    TransactionType,
    TransactionUpdate,
)
from app.services.transaction_service import (
    create_transaction,
    delete_transaction,
    list_transactions,
    update_transaction,
)


router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=TransactionListResponse)
async def get_transactions(
    search: str | None = Query(default=None, max_length=100),
    date_from: date | None = None,
    date_to: date | None = None,
    month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    category: TransactionCategory | None = None,
    type: TransactionType | None = None,
    amount_min: float | None = Query(default=None, ge=0),
    amount_max: float | None = Query(default=None, ge=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
) -> TransactionListResponse:
    transactions, total = await list_transactions(
        str(current_user["_id"]),
        {
            "search": search,
            "date_from": date_from,
            "date_to": date_to,
            "month": month,
            "category": category.value if category else None,
            "type": type.value if type else None,
            "amount_min": amount_min,
            "amount_max": amount_max,
            "skip": skip,
            "limit": limit,
        },
    )
    return TransactionListResponse(transactions=transactions, total=total)


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def add_transaction(
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_user),
) -> TransactionResponse:
    return await create_transaction(str(current_user["_id"]), payload)


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def edit_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
) -> TransactionResponse:
    return await update_transaction(str(current_user["_id"]), transaction_id, payload)


@router.delete("/{transaction_id}", response_model=APIResponse)
async def remove_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
) -> APIResponse:
    await delete_transaction(str(current_user["_id"]), transaction_id)
    return APIResponse(message="Transaction deleted successfully.")

