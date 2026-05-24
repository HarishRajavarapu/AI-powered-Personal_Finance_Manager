from fastapi import APIRouter

from app.routes import analytics, auth, budgets, health, insights, profile, transactions, admin


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(profile.router)
api_router.include_router(transactions.router)
api_router.include_router(budgets.router)
api_router.include_router(analytics.router)
api_router.include_router(insights.router)
api_router.include_router(admin.router)
