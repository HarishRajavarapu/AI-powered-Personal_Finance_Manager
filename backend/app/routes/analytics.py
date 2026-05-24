from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.analytics import AnalyticsChartsResponse, DashboardResponse
from app.services.analytics_service import charts_data, dashboard_data


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(current_user: dict = Depends(get_current_user)) -> DashboardResponse:
    return await dashboard_data(str(current_user["_id"]))


@router.get("/charts", response_model=AnalyticsChartsResponse)
async def charts(current_user: dict = Depends(get_current_user)) -> AnalyticsChartsResponse:
    return await charts_data(str(current_user["_id"]))

