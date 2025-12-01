# main.py

import cv2, numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from PIL import Image

from multi_model_detection import detect_best_conf
from vision import annotate, encode_base64
from analysis_pipeline import (
    analyze_nutrition, analyze_diet, compute_health_score, missing_nutrients
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(None),
    portion: float = Form(1.0),
    conditions: str = Form(""),
    description: str = Form(""),
    model_type: str = Form("auto"),
):
    labels = []
    boxes = {}
    confs = {}

    cond_list = [c.strip() for c in conditions.split(",") if c.strip()]

    if file:
        img_arr = np.frombuffer(await file.read(), np.uint8)
        img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)

        labels, confs, boxes = detect_best_conf(img, model_type)

    if description.strip():
        labels.extend([x.strip().lower() for x in description.split(",")])

    labels = list(set(labels))  # unique

    if not labels:
        return {"detected_food": [], "error": "No food detected"}

    nutrition = analyze_nutrition(labels, portion, cond_list)
    score = compute_health_score(nutrition)
    missing = missing_nutrients(nutrition)

    diet = analyze_diet(labels, nutrition, cond_list)

    annotated_img = None
    if boxes:
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
