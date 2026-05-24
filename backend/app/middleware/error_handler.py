from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def error_response(message: str, code: int, details: object | None = None) -> dict:
    payload: dict[str, object] = {
        "success": False,
        "message": message,
        "code": code,
    }
    if details is not None:
        payload["details"] = details
    return payload


async def http_exception_handler(
    request: Request,
    exc: HTTPException | StarletteHTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(exc.detail), exc.status_code),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            "Validation failed.",
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            exc.errors(),
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            "Something went wrong. Please try again later.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

