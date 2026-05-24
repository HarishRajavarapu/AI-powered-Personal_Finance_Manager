from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.config.settings import get_settings


class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None


mongodb = MongoDB()


async def connect_to_mongo() -> None:
    settings = get_settings()
    if not settings.mongodb_configured:
        raise RuntimeError("MONGODB_URI is not configured. Add it to backend/.env.")

    # Allow a short-term prototype override to skip TLS certificate validation
    # when connecting to Atlas. This should only be used for debugging/testing
    # and must be disabled in production.
    client_kwargs = {}
    if getattr(settings, "MONGODB_TLS_ALLOW_INVALID_CERTS", False):
        client_kwargs["tlsAllowInvalidCertificates"] = True

    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI, **client_kwargs)
    mongodb.database = mongodb.client[settings.MONGODB_DB_NAME]

    # Ping during startup so deployment failures are visible immediately.
    await mongodb.database.command("ping")
    await create_indexes()


async def close_mongo_connection() -> None:
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        mongodb.database = None


def get_database() -> AsyncIOMotorDatabase:
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")
    return mongodb.database


async def ping_database() -> bool:
    try:
        database = get_database()
        await database.command("ping")
        return True
    except (RuntimeError, PyMongoError):
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
