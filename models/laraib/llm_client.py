# llm_client.py

import json
from typing import List, Dict, Any
import requests
import os
from datetime import datetime

from diet_prompt import build_prompt
from config import GROQ_API_KEY, GROQ_API_BASE, LLM_MODEL, LLM_MAX_TOKENS

headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)


def save_raw_response(raw_text: str, label: str = "raw"):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(LOG_DIR, f"llm_response_{label}_{timestamp}.json")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(raw_text)
    print(f"📁 Raw LLM response saved -> {filename}")


def call_llm(
    food_labels: List[str],
    portion_size: float,
    conditions: List[str],
    nutrition: Dict[str, Any]
) -> Dict[str, Any]:

    prompt = build_prompt(food_labels, portion_size, conditions, nutrition)

    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": LLM_MAX_TOKENS,
        "temperature": 0.2,
    }

    try:
        response = requests.post(
            f"{GROQ_API_BASE}/chat/completions",
            json=payload,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        response_text = response.json()["choices"][0]["message"]["content"]

        # save raw JSON text for debugging
        save_raw_response(response_text, label="success")

    except Exception as e:
        print("🔥 Groq API Error:", e)
        save_raw_response(str(e), label="error")
        return fallback_response()

    # try parsing JSON
    try:
        parsed = json.loads(response_text)
        if "diet_recommendations" not in parsed:
            raise ValueError("Missing diet_recommendations")
        return parsed

    except Exception as e:
        print("⚠️ Invalid JSON from LLM:", e)
        save_raw_response(response_text, label="invalid_json")
        return fallback_response()


def fallback_response() -> Dict[str, Any]:
    return {
        "diet_recommendations": {
            "add": ["Include vegetables for fiber"],
            "reduce": ["Reduce fried/oily items"],
            "pairings": ["Salad or yogurt pairs well"],
            "overall_comment": "Fallback: LLM unavailable.",
        }
    }
