from typing import Literal

from pydantic import BaseModel, ConfigDict


class APIResponse(BaseModel):
    success: bool = True
    message: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    version: str


class DatabaseHealthResponse(BaseModel):
    status: Literal["ok", "unavailable"]
    database: str
    connected: bool


class MongoModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={},
    )

