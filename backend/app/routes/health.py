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
    is_configured = settings.mongodb_configured
    is_connected = await ping_database() if is_configured else False
    message = None
    if not is_configured:
        message = "MONGODB_URI is not configured in this runtime."
    elif not is_connected:
        message = "MongoDB is configured but not reachable. Check Render logs and MongoDB Atlas Network Access."

    return DatabaseHealthResponse(
        status="ok" if is_connected else "unavailable",
        database=settings.MONGODB_DB_NAME,
        configured=is_configured,
        connected=is_connected,
        message=message,
    )
