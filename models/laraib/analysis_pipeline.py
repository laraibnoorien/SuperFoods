# analysis_pipeline.py

from typing import List, Dict, Any
from multi_model_detection import detect_best_conf
from llm_client import call_llm

# Approximate nutrition database per standard portion
# Values are realistic approximations from common nutrition references.
FOOD_NUTRITION_DB: Dict[str, Dict[str, Any]] = {
    # Western items
    "pancake": {
        "calories": 350,
        "macros": {"protein_g": 8, "carbs_g": 60, "fat_g": 9},
        "micros": {"iron_mg": 2.0, "calcium_mg": 180, "magnesium_mg": 30, "potassium_mg": 220},
    },
    "french fries": {
        "calories": 365,
        "macros": {"protein_g": 4, "carbs_g": 48, "fat_g": 17},
        "micros": {"iron_mg": 1.1, "calcium_mg": 18, "magnesium_mg": 42, "potassium_mg": 677},
    },
    "hamburger": {
        "calories": 350,
        "macros": {"protein_g": 17, "carbs_g": 30, "fat_g": 18},
        "micros": {"iron_mg": 3.0, "calcium_mg": 110, "magnesium_mg": 27, "potassium_mg": 270},
    },

    # Indian items
    "idli": {
        "calories": 60,
        "macros": {"protein_g": 2, "carbs_g": 12, "fat_g": 0.4},
        "micros": {"iron_mg": 0.2, "calcium_mg": 8, "magnesium_mg": 5, "potassium_mg": 30},
    },
    "chutney": {
        # Highly variable; approximate coconut/coriander chutney per small serving
        "calories": 80,
        "macros": {"protein_g": 2, "carbs_g": 6, "fat_g": 6},
        "micros": {"iron_mg": 0.6, "calcium_mg": 20, "magnesium_mg": 12, "potassium_mg": 60},
    },
    "chapati": {
        "calories": 120,
        "macros": {"protein_g": 3.5, "carbs_g": 18, "fat_g": 3},
        "micros": {"iron_mg": 1.0, "calcium_mg": 10, "magnesium_mg": 22, "potassium_mg": 90},
    },
}

# Synonym / label normalization mapping
LABEL_CANONICAL = {
    "pancake": "pancake",
    "pancakes": "pancake",
    "french fries": "french fries",
    "french_fries": "french fries",
    "fries": "french fries",
    "hamburger": "hamburger",
    "burger": "hamburger",
    "idli": "idli",
    "idlis": "idli",
    "chuttney": "chutney",
    "chutney": "chutney",
    "chapati": "chapati",
    "chappathi": "chapati",
    "chappati": "chapati",
}


def normalize_label(label: str) -> str:
    key = label.strip().lower()
    return LABEL_CANONICAL.get(key, key)


def aggregate_nutrition(food_labels: List[str], portion_size: float) -> Dict[str, Any]:
    """
    Aggregate calories/macros/micros from database for all recognized foods.
    """
    total_cal = 0.0
    macros = {"protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    micros = {"iron_mg": 0.0, "calcium_mg": 0.0, "magnesium_mg": 0.0, "potassium_mg": 0.0}

    recognized_items = []

    for raw_label in food_labels:
        canon = normalize_label(raw_label)
        info = FOOD_NUTRITION_DB.get(canon)
        if not info:
            continue

        recognized_items.append(canon)

        factor = portion_size  # 1.0 = standard portion
        total_cal += info["calories"] * factor

        for k in macros:
            macros[k] += info["macros"][k] * factor

        for k in micros:
            micros[k] += info["micros"][k] * factor

    return {
        "recognized_items": list(sorted(set(recognized_items))),
        "estimated_calories": int(round(total_cal)),
        "macros": {k: round(v, 1) for k, v in macros.items()},
        "micronutrients": {k: round(v, 1) for k, v in micros.items()},
    }


def analyze_meal(image,
                 portion_size: float,
                 conditions: List[str]) -> Dict[str, Any]:

    labels, confs, boxes = detect_best_conf(image)

    if not labels:
        return {
            "detected_food": [],
            "estimated_calories": 0,
            "macros": {"protein_g": 0, "carbs_g": 0, "fat_g": 0},
            "micronutrients": {
                "iron_mg": 0, "calcium_mg": 0, "magnesium_mg": 0, "potassium_mg": 0
            },
            "yolo_confidence": {},
            "yolo_boxes": {},
            "diet_recommendations": {
                "add": [],
                "reduce": [],
                "pairings": [],
                "overall_comment": "No food detected. Try a clearer photo.",
            },
        }

    # Calculate numeric nutrition from DB
    nutrition = aggregate_nutrition(labels, portion_size)

    # Ask LLM only for advice/pairings
    llm_data = call_llm(labels, portion_size, conditions, nutrition)
    diet_recs = llm_data.get("diet_recommendations", {
        "add": [],
        "reduce": [],
        "pairings": [],
        "overall_comment": "",
    })

    # Final response for frontend
    return {
        "detected_food": labels,
        "recognized_items": nutrition["recognized_items"],
        "estimated_calories": nutrition["estimated_calories"],
        "macros": nutrition["macros"],
        "micronutrients": nutrition["micronutrients"],
        "yolo_confidence": confs,
        "yolo_boxes": boxes,
        "diet_recommendations": diet_recs,
    }
