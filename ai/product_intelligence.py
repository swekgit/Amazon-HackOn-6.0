import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

def analyze_product(
    title,
    customer_tags,
    query
):

    prompt = f"""
You are a shopping assistant.

User Query:
{query}

Customer Tags:
{customer_tags}

Product:
{title}

Return ONLY valid JSON.

Format:

{{
    "fit_score": 0,
    "best_for": [],
    "pros": [],
    "cons": [],
    "avoid_if": []
}}
"""

    try:

        response = model.generate_content(
            prompt
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace(
                "```json",
                ""
            ).replace(
                "```",
                ""
            )

        return json.loads(text)

    except Exception as e:

        return {
            "fit_score": 0,
            "best_for": [],
            "pros": [],
            "cons": [],
            "avoid_if": [],
            "error": str(e)
        }