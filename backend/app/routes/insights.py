from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.insight import InsightResponse
from app.services.ai_service import generate_insights


router = APIRouter(prefix="/insights", tags=["AI Insights"])


@router.get("", response_model=InsightResponse)
async def insights(current_user: dict = Depends(get_current_user)) -> InsightResponse:
    return await generate_insights(str(current_user["_id"]))

