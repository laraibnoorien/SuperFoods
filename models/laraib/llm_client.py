# llm_client.py

import json, os
import requests
from datetime import datetime
from config import GROQ_API_KEY, GROQ_API_BASE, LLM_MODEL, LLM_MAX_TOKENS

headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

os.makedirs("logs", exist_ok=True)


def _save_log(text, name):
    path = f"logs/{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def call_llm(prompt: str):
    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": LLM_MAX_TOKENS,
        "temperature": 0.2,
    }

    try:
        r = requests.post(f"{GROQ_API_BASE}/chat/completions", json=payload, headers=headers, timeout=25)
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"]
        _save_log(text, "success")
        return json.loads(text)
    except Exception as e:
        _save_log(str(e), "error")
        print("LLM ERROR:", e)
        return None
