from pydantic import BaseModel


class InsightResponse(BaseModel):
    summary: str
    suggestions: list[str]
    behavior: list[str]
    generated_with_ai: bool

