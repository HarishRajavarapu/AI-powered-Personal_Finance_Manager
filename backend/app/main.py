from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.database.mongodb import close_mongo_connection, connect_to_mongo
from app.middleware.error_handler import register_exception_handlers
from app.routes.api import api_router


settings = get_settings()
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create and close shared resources for the application lifecycle."""
    if not settings.mongodb_configured:
        message = (
            "MONGODB_URI is not configured. Set it in Render environment variables; "
            "backend/.env is only used for local development."
        )
        if settings.is_production:
            logger.critical(message)
            raise RuntimeError(message)
        logger.warning(message)
    else:
        try:
            await connect_to_mongo()
        except Exception:
            # Log the exception so deployment logs show the reason for failure.
            logger.exception("Failed to connect to MongoDB during startup")
            if settings.is_production:
                raise
            # Keep local development booting; database-dependent routes will report unavailable.
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for F!NO, the Financial Operator.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "disabled",
    }
