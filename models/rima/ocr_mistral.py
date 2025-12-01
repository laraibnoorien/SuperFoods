# models/rima/ocr_mistral.py

import io
import base64
from typing import List

from PIL import Image
from mistralai import Client

from config import MISTRAL_API_KEY

client = Client(api_key=MISTRAL_API_KEY)

# Simple vocabulary of grocery items we care about
KNOWN_INGREDIENTS = [
    "milk", "egg", "eggs", "apple", "banana", "spinach", "chicken",
    "bread", "rice", "oil", "salt", "tomato", "onion", "potato",
    "cheese", "curd", "yogurt"
]


def extract_items_from_text(text: str) -> List[str]:
    found = []
    text = text.lower()
    for item in KNOWN_INGREDIENTS:
        if item in text:
            found.append(item)
    return list(set(found))  # unique


def ocr_bill_mistral(image: Image.Image) -> List[str]:
    """
    Use Mistral multimodal OCR to extract items from a bill image.
    Returns a list of matched grocery item names.
    """
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = (
        "You are reading a grocery store bill image. "
        "Extract only the food item names as plain text. "
        "Ignore prices, quantities, codes, discounts and totals. "
        "Return a clean comma-separated list of item names."
    )

    resp = client.chat.complete(
        model="pixtral-12b-ocr-latest",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{img_b64}"
                        },
                    },
                ],
            }
        ],
    )

    raw = resp.choices[0].message.content.strip()
    return extract_items_from_text(raw)
