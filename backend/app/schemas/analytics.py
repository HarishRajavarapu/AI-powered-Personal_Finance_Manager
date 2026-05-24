from pydantic import BaseModel

from app.schemas.budget import BudgetResponse
from app.schemas.transaction import TransactionResponse


class SummaryCards(BaseModel):
    total_balance: float
    total_income: float
    total_expenses: float
    savings: float


class MonthPoint(BaseModel):
    month: str
    income: float
    expenses: float
    savings: float


class CategoryPoint(BaseModel):
    category: str
    amount: float


class DashboardResponse(BaseModel):
    summary: SummaryCards
    monthly_overview: list[MonthPoint]
    recent_transactions: list[TransactionResponse]
    budget_progress: list[BudgetResponse]


class AnalyticsChartsResponse(BaseModel):
    category_spending: list[CategoryPoint]
    income_vs_expenses: list[MonthPoint]
    spending_trend: list[MonthPoint]
    savings_growth: list[MonthPoint]

