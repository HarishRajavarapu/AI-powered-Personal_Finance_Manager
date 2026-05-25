from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.config.settings import get_settings


class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None
    last_error: str | None = None


mongodb = MongoDB()


async def connect_to_mongo() -> None:
    settings = get_settings()
    if not settings.mongodb_configured:
        mongodb.last_error = "MONGODB_URI is not configured."
        raise RuntimeError(
            "MONGODB_URI is not configured. Add it to backend/.env locally or to your host environment variables."
        )

    # Allow a short-term prototype override to skip TLS certificate validation
    # when connecting to Atlas. This should only be used for debugging/testing
    # and must be disabled in production.
    client_kwargs = {
        "serverSelectionTimeoutMS": settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    }
    if getattr(settings, "MONGODB_TLS_ALLOW_INVALID_CERTS", False):
        client_kwargs["tlsAllowInvalidCertificates"] = True

    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI, **client_kwargs)
    mongodb.database = mongodb.client[settings.MONGODB_DB_NAME]

    try:
        # Ping during startup so deployment failures are visible immediately.
        await mongodb.database.command("ping")
        await create_indexes()
        mongodb.last_error = None
    except Exception as exc:
        mongodb.last_error = str(exc)
        await close_mongo_connection()
        raise


async def close_mongo_connection() -> None:
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        mongodb.database = None


def get_database() -> AsyncIOMotorDatabase:
    if mongodb.database is None:
        message = "Database is not connected."
        if mongodb.last_error:
            message = f"{message} Last connection error: {mongodb.last_error}"
        raise RuntimeError(message)
    return mongodb.database


async def ping_database() -> bool:
    try:
        database = get_database()
        await database.command("ping")
        return True
    except (RuntimeError, PyMongoError) as exc:
        mongodb.last_error = str(exc)
        return False


async def create_indexes() -> None:
    if mongodb.database is None:
        return

    await mongodb.database.users.create_index("email", unique=True)
    await mongodb.database.transactions.create_index([("user_id", 1), ("date", -1)])
    await mongodb.database.transactions.create_index([("user_id", 1), ("category", 1)])
    await mongodb.database.budgets.create_index(
        [("user_id", 1), ("month", 1), ("category", 1)],
        unique=True,
    )
