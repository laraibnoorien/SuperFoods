# analysis_pipeline.py

from llm_client import call_llm
from diet_prompt import nutrition_prompt, diet_prompt


def analyze_nutrition(labels, portion, conditions):
    data = call_llm(nutrition_prompt(labels, portion, conditions)) or {}
    return data


def analyze_diet(labels, nutrition, conditions):
    data = call_llm(diet_prompt(labels, nutrition, conditions)) or {}
    return data


def compute_health_score(nutrition):
    cal = nutrition.get("estimated_calories", 0)
    macros = nutrition.get("macros", {})
    score = 100

    if cal > 850: score -= 45
    elif cal > 700: score -= 30
    elif cal > 550: score -= 20

    if macros.get("fat_g", 0) > 30: score -= 15
    if macros.get("fiber_g", 0) < 5: score -= 10

    return max(0, min(100, score))


def missing_nutrients(nutrition):
    micros = nutrition.get("micronutrients", {})
    missing = []
    if micros.get("iron_mg", 6) < 2: missing.append("Iron")
    if micros.get("fiber_g", 7) < 3: missing.append("Fiber")
    if micros.get("vitamin_c_mg", 30) < 10: missing.append("Vitamin C")
    if micros.get("calcium_mg", 200) < 100: missing.append("Calcium")
    return missing
