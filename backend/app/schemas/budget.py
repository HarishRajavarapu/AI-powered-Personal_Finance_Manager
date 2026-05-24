from pydantic import BaseModel, Field, field_validator

from app.schemas.transaction import TransactionCategory


class BudgetBase(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    category: TransactionCategory
    limit_amount: float = Field(..., gt=0)
    alert_threshold: int = Field(default=90, ge=50, le=100)

    @field_validator("month")
    @classmethod
    def validate_month(cls, value: str) -> str:
        year, month = value.split("-")
        if not 1 <= int(month) <= 12:
            raise ValueError("Month must be between 01 and 12.")
        if int(year) < 2000:
            raise ValueError("Year must be 2000 or later.")
        return value


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: str
    spent: float = 0
    remaining: float = 0
    progress: float = 0
    is_over_budget: bool = False


class BudgetListResponse(BaseModel):
    budgets: list[BudgetResponse]
    total: int

