from datetime import UTC, datetime


def utc_now() -> datetime:
    return datetime.now(UTC)


def month_key(value: datetime | None = None) -> str:
    date_value = value or utc_now()
    return date_value.strftime("%Y-%m")

