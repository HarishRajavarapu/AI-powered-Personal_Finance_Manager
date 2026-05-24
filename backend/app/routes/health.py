from fastapi import APIRouter, status

from app.config.settings import get_settings
from app.database.mongodb import ping_database
from app.schemas.common import DatabaseHealthResponse, HealthResponse


router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        version="1.0.0",
    )


@router.get("/database", response_model=DatabaseHealthResponse)
async def database_health_check() -> DatabaseHealthResponse:
    settings = get_settings()
    is_connected = await ping_database() if settings.mongodb_configured else False
    return DatabaseHealthResponse(
        status="ok" if is_connected else "unavailable",
        database=settings.MONGODB_DB_NAME,
        connected=is_connected,
    )

