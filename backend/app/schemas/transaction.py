from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionCategory(str, Enum):
    food = "Food"
    travel = "Travel"
    shopping = "Shopping"
    bills = "Bills"
    education = "Education"
    entertainment = "Entertainment"
    health = "Health"
    salary = "Salary"
    investments = "Investments"
    other = "Other"


class TransactionBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    amount: float = Field(..., gt=0)
    category: TransactionCategory
    type: TransactionType
    date: datetime
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("notes")
    @classmethod
    def empty_notes_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int

