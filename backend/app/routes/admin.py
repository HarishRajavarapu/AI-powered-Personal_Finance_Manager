from typing import List
import traceback

from fastapi import APIRouter, Header, HTTPException

from app.config.settings import get_settings
from app.database.mongodb import connect_to_mongo, ping_database


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/reconnect-db")
async def reconnect_db(x_admin_token: str | None = Header(None)) -> dict:
    """Protected endpoint to attempt a DB reconnect from the running process.

    Requires header `X-ADMIN-TOKEN` equal to the `JWT_SECRET_KEY` (or other secret configured).
    Returns a short diagnostic (no secrets).
    """
    settings = get_settings()
    # Basic auth: require the same secret used as JWT secret. This is not a production auth scheme.
    expected = settings.JWT_SECRET_KEY
    if not x_admin_token or x_admin_token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        await connect_to_mongo()
        connected = await ping_database()
        return {"status": "ok" if connected else "unavailable", "connected": connected}
    except Exception as exc:  # pragma: no cover - diagnostic endpoint
        tb = traceback.format_exc()
        # Return only the exception message and last 5 lines of the trace to help debugging.
        trace_lines: List[str] = tb.splitlines()[-5:]
        return {"status": "error", "error": str(exc), "trace": trace_lines}
