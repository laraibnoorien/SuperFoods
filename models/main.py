# models/laraib/main.py

import re
import json
from typing import Optional, List

import uvicorn
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv
from groq import Groq


from models.rima.inventory_routes import router as inventory_router
from models.rima.inventory_routes import inventory
from models.rima.ocr_mistral import ocr_bill_mistral    # if used here

from models.laraib.vision import annotate, encode_base64
from models.laraib.config import GROQ_API_KEY
from models.laraib.multi_model_detection import detect_best_conf
from laraib.analysis_pipeline import (
    analyze_nutrition,
    analyze_diet,
    compute_health_score,
    missing_nutrients,
)

load_dotenv()

client = Groq(api_key=GROQ_API_KEY)
LLM_MODEL = "openai/gpt-oss-20b"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount inventory routes → /inventory, /inventory/scan-item, etc.
app.include_router(inventory_router)


class RecipeRequest(BaseModel):
    calories: Optional[int] = None
    diet: str = "any"
    servings: int = 1
    ingredients: List[str]


def safe_json_parse(text: str):
    """Try very hard to get a valid JSON object out of LLM output."""
    text = text.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    open_brace = text.find("{")
    close_brace = text.rfind("}")
    if open_brace != -1 and close_brace != -1:
        candidate = text[open_brace : close_brace + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    cleaned = re.sub(r",(\s*[}\]])", r"\1", text)
    try:
        return json.loads(cleaned)
    except Exception:
        raise HTTPException(status_code=500, detail=f"AI JSON failed:\n{text}")


@app.post("/recipes/generate")
async def generate_recipe(req: RecipeRequest):
    # build freshness-weighted ingredients from inventory
    usable = {}

    for ing in req.ingredients:
        match = next(
            (i for i in inventory if i.name.lower() == ing.lower()),
            None,
        )
        if match:
            # fresh > expiring > expired (expired will normally be filtered out in UI)
            if match.status == "fresh":
                usable[ing] = 90
            elif match.status == "expiring":
                usable[ing] = 60
            else:
                usable[ing] = 10
        else:
            usable[ing] = 80  # assume fresh if not tracked

    prompt = f"""
Generate a realistic, cookable recipe using ONLY these ingredients (with higher scores used more):

Ingredients with freshness score:
{usable}

Diet: {req.diet}
Servings: {req.servings}
Target Calories: {req.calories or "flexible"}

Return ONLY a single valid JSON object. No markdown, no explanation:

{{
 "name": "",
 "cookTime": 0,
 "servings": 0,
 "calories": 0,
 "ingredients": [],
 "instructions": [],
 "tags": []
}}
"""

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.25,
        max_tokens=600,
    )
    text = response.choices[0].message.content
    parsed = safe_json_parse(text)
    return parsed


@app.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(None),
    portion: float = Form(1.0),
    conditions: str = Form(""),
    description: str = Form(""),
    model_type: str = Form("auto"),
):
    labels: List[str] = []
    boxes = {}
    confs = {}
    img = None

    cond_list = [c.strip() for c in conditions.split(",") if c.strip()]

    if file:
        img_arr = np.frombuffer(await file.read(), np.uint8)
        img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
        labels, confs, boxes = detect_best_conf(img, model_type)

    if description.strip():
        labels.extend([x.strip().lower() for x in description.split(",")])

    labels = list(set(labels))

    if not labels:
        return {"detected_food": [], "error": "No food detected"}

    nutrition = analyze_nutrition(labels, portion, cond_list)
    nutrition["detected_food"] = labels

    score = compute_health_score(nutrition)
    missing = missing_nutrients(nutrition)
    diet = analyze_diet(labels, nutrition, cond_list)

    annotated_img = None
    if boxes and img is not None:
        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        annotated_img = encode_base64(annotate(pil_img, boxes, confs))

    return {
        "detected_food": labels,
        "estimated_calories": nutrition.get("estimated_calories", 0),
        "macros": nutrition.get("macros", {}),
        "micronutrients": nutrition.get("micronutrients", {}),
        "glycemic_index": nutrition.get("glycemic_index", 0),
        "diet_suitability": nutrition.get("diet_suitability", {}),
        "overall_comment": nutrition.get("overall_comment", ""),
        "diet_recommendations": diet,
        "health_score": score,
        "missing_nutrients": missing,
        "image_with_boxes": annotated_img,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
