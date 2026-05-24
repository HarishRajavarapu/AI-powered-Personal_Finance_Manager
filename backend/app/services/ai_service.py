import asyncio
import json

from google import genai

from app.config.settings import get_settings
from app.services.analytics_service import charts_data, dashboard_data


def fallback_insights(dashboard: dict, charts: dict) -> dict:
    summary = dashboard["summary"]
    savings = summary["savings"]
    expenses = summary["total_expenses"]
    income = summary["total_income"]
    category_spending = charts["category_spending"]
    top_category = category_spending[0] if category_spending else None

    suggestions = []
    behavior = []

    if top_category:
        suggestions.append(
            f"Review {top_category['category']} spending first; it is the largest expense area this month."
        )
        behavior.append(
            f"{top_category['category']} accounts for the highest tracked spending this month."
        )

    if income and expenses / income > 0.7:
        suggestions.append("Try setting a tighter weekly spending cap to lift your savings rate.")
        behavior.append("Expenses are using more than 70% of this month's income.")
    elif savings > 0:
        suggestions.append("Your current savings trend is positive; consider moving surplus into investments.")
        behavior.append("Income is currently ahead of expenses for this month.")
    else:
        suggestions.append("Start with one category budget and reduce non-essential expenses.")
        behavior.append("Current month expenses are equal to or above income.")

    return {
        "summary": "Your finances are ready for review. Add more transactions for sharper AI recommendations.",
        "suggestions": suggestions[:4],
        "behavior": behavior[:4],
        "generated_with_ai": False,
    }


def parse_ai_response(text: str) -> dict:
    cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(cleaned)
    return {
        "summary": str(data.get("summary", "")).strip(),
        "suggestions": [str(item).strip() for item in data.get("suggestions", [])][:5],
        "behavior": [str(item).strip() for item in data.get("behavior", [])][:5],
        "generated_with_ai": True,
    }


async def generate_insights(user_id: str) -> dict:
    settings = get_settings()
    dashboard = await dashboard_data(user_id)
    charts = await charts_data(user_id)

    if not settings.GEMINI_API_KEY:
        return fallback_insights(dashboard, charts)

    prompt = f"""
You are a practical personal finance coach. Analyze this user's finance data and return JSON only.

Required JSON shape:
{{
  "summary": "one concise monthly summary",
  "suggestions": ["specific saving suggestion", "specific saving suggestion"],
  "behavior": ["spending behavior observation", "spending behavior observation"]
}}

Dashboard data:
{json.dumps(dashboard, default=str)}

Chart data:
{json.dumps(charts, default=str)}
"""

    def call_gemini() -> str:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        return response.text or ""

    try:
        text = await asyncio.to_thread(call_gemini)
        parsed = parse_ai_response(text)
        if parsed["summary"] and parsed["suggestions"]:
            return parsed
    except Exception:
        return fallback_insights(dashboard, charts)

    return fallback_insights(dashboard, charts)

