# analysis_pipeline.py

from llm_client import call_llm
from diet_prompt import nutrition_prompt, diet_prompt


def analyze_nutrition(labels, portion, conditions):
    data = call_llm(nutrition_prompt(labels, portion, conditions)) or {}
    return data


def analyze_diet(labels, nutrition, conditions):
    data = call_llm(diet_prompt(labels, nutrition, conditions)) or {}
    return data


# ---------- Missing nutrients helper (unchanged in behavior) ----------

def missing_nutrients(nutrition):
    micros = nutrition.get("micronutrients", {})
    missing = []
    if micros.get("iron_mg", 6) < 2:
        missing.append("Iron")
    if micros.get("fiber_g", 7) < 3:
        missing.append("Fiber")
    if micros.get("vitamin_c_mg", 30) < 10:
        missing.append("Vitamin C")
    if micros.get("calcium_mg", 200) < 100:
        missing.append("Calcium")
    return missing


# =========================
# SMART HEALTH SCORING
# =========================

# 1️⃣ Macro Balance (40% weight)
def macro_balance_score(nutrition):
    macros = nutrition.get("macros", {})
    p = macros.get("protein_g", 0) * 4
    c = macros.get("carbs_g", 0) * 4
    f = macros.get("fat_g", 0) * 9

    total = p + c + f
    if total <= 0:
        return 0

    rp, rc, rf = p / total * 100, c / total * 100, f / total * 100

    score = 40  # full marks if all in range

    # Protein 20–35%
    if rp < 20 or rp > 35:
        score -= 10

    # Carbs 40–60%
    if rc < 40 or rc > 60:
        score -= 10

    # Fat 20–30%
    if rf < 20 or rf > 30:
        score -= 10

    return max(score, 0)


# 2️⃣ Micronutrient Density (25% weight)
def micronutrient_score(nutrition):
    micros = nutrition.get("micronutrients", {}) or {}
    total = len(micros)

    # Use our existing missing_nutrients helper
    missing = missing_nutrients(nutrition)
    missing_count = len(missing)

    if total == 0:
        return 0

    score = 25 * (total - missing_count) / total
    return max(min(score, 25), 0)


# Junk food + desserts list
JUNK_KEYWORDS = [
    "burger", "pizza", "fries", "samosa", "pakora", "kachori",
    "chips", "coke", "soft drink", "cola", "pastry", "donut",
    "cake", "fried", "roll", "bhaji", "tikki", "maggi"
]


def junk_penalty(labels):
    lowered = " ".join(labels).lower()
    penalty = 0
    for word in JUNK_KEYWORDS:
        if word in lowered:
            penalty += 7  # each junk word hurts
    return min(penalty, 25)  # cap penalty


# 3️⃣ Food Quality (25% weight)
def quality_score_v2(nutrition):
    score = 25
    cal = nutrition.get("estimated_calories", 0)
    gi = nutrition.get("glycemic_index", 0)
    fat = nutrition.get("macros", {}).get("fat_g", 0)
    fiber = nutrition.get("macros", {}).get("fiber_g", 0)

    # Calories
    if cal > 650:
        score -= 10
    # GI
    if gi > 70:
        score -= 7
    # Fat
    if fat > 25:
        score -= 5
    # Fiber
    if fiber < 5:
        score -= 3

    return max(score, 0)


# 4️⃣ Medical Suitability (10% weight)
def suitability_score(nutrition):
    suit = nutrition.get("diet_suitability", {}) or {}
    good = sum(1 for v in suit.values() if v == "good")
    bad = sum(1 for v in suit.values() if v == "restricted")
    score = 10 + (good * 2) - (bad * 4)
    return max(min(score, 10), 0)


# 5️⃣ Final Health Score (0 → 100)
def compute_health_score(nutrition):
    """
    Combines macro balance, micronutrients, food quality, and medical suitability.
    Strong junk penalty if typical fast food / desserts are present.
    """
    labels = nutrition.get("detected_food", [])

    macro_score = macro_balance_score(nutrition)     # 0–40
    micro_score = micronutrient_score(nutrition)     # 0–25
    quality = quality_score_v2(nutrition)           # 0–25
    suitability = suitability_score(nutrition)      # 0–10

    score = macro_score + micro_score + quality + suitability

    # Junk penalty last, so junk can drag down even a macro-balanced meal
    penalty = junk_penalty(labels)
    score -= penalty

    return max(0, min(100, round(score)))
