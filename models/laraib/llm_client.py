# llm_client.py
import json
import os
from groq import Groq
from config import LLM_MODEL, LLM_MAX_TOKENS
from diet_prompt import build_prompt
import sys

api=""
client = Groq(api_key=api)

def call_llm(food_items, portion_size, conditions):
    prompt = build_prompt(food_items, portion_size, conditions)

    resp = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You must respond ONLY with valid JSON. "
                    "No comments. No trailing commas. No explanations."
                )
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        top_p=1,
        max_completion_tokens=LLM_MAX_TOKENS,
        response_format={"type": "json_object"},  # << KEY FIX 🔥
        stream=False
    )

    content = resp.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # attempt auto-fix by closing last brace
        if not content.endswith("}"):
            content = content.rsplit("}", 1)[0] + "}"
            try:
                return json.loads(content)
            except Exception:
                pass

        raise RuntimeError(f"Invalid JSON from LLM:\n{content}")


if __name__ == "__main__":
    # Quick test to confirm JSON works
    test = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": '{"ping": "test"}'}],
        response_format={"type": "json_object"},
        stream=False
    )
    print(test.choices[0].message.content)
