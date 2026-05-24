from fastapi import APIRouter, Depends, Query, status

from app.middleware.auth import get_current_user
from app.schemas.budget import BudgetCreate, BudgetListResponse, BudgetResponse, BudgetUpdate
from app.schemas.common import APIResponse
from app.services.budget_service import create_budget, delete_budget, list_budgets, update_budget


router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=BudgetListResponse)
async def get_budgets(
    month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    current_user: dict = Depends(get_current_user),
) -> BudgetListResponse:
    budgets, total = await list_budgets(str(current_user["_id"]), month)
    return BudgetListResponse(budgets=budgets, total=total)


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def add_budget(
    payload: BudgetCreate,
    current_user: dict = Depends(get_current_user),
) -> BudgetResponse:
    return await create_budget(str(current_user["_id"]), payload)


@router.put("/{budget_id}", response_model=BudgetResponse)
async def edit_budget(
    budget_id: str,
    payload: BudgetUpdate,
    current_user: dict = Depends(get_current_user),
) -> BudgetResponse:
    return await update_budget(str(current_user["_id"]), budget_id, payload)


@router.delete("/{budget_id}", response_model=APIResponse)
async def remove_budget(
    budget_id: str,
    current_user: dict = Depends(get_current_user),
) -> APIResponse:
    await delete_budget(str(current_user["_id"]), budget_id)
    return APIResponse(message="Budget deleted successfully.")

