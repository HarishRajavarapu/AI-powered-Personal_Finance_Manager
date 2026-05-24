from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.database.mongodb import close_mongo_connection, connect_to_mongo
from app.middleware.error_handler import register_exception_handlers
from app.routes.api import api_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create and close shared resources for the application lifecycle."""
    if settings.mongodb_configured:
        await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for the AI-Powered Personal Finance Manager.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
