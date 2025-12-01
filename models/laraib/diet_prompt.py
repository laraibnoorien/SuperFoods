# diet_prompt.py

from typing import List, Dict, Any


def build_prompt(food_items: List[str],
                 portion_size: float,
                 conditions: List[str],
                 nutrition: Dict[str, Any]) -> str:

    foods_str = ", ".join(food_items) if food_items else "unknown"
    conditions_str = ", ".join(conditions) if conditions else "none"

    cal = nutrition.get("estimated_calories", 0)
    macros = nutrition.get("macros", {})
    micros = nutrition.get("micronutrients", {})

    return f"""
You are a clinical nutritionist AI. Respond with ONLY pure JSON. 
Do NOT include markdown, explanations, comments, or line breaks inside strings.
If unsure, give your best medically safe advice.

Meal: [{foods_str}]
Portion multiplier: {portion_size}

Nutrition (already calculated):
Calories: {cal}
Protein: {macros.get("protein_g", 0)}g
Carbs: {macros.get("carbs_g", 0)}g
Fat: {macros.get("fat_g", 0)}g
Iron: {micros.get("iron_mg", 0)}mg
Calcium: {micros.get("calcium_mg", 0)}mg
Magnesium: {micros.get("magnesium_mg", 0)}mg
Potassium: {micros.get("potassium_mg", 0)}mg

User conditions: [{conditions_str}]

Return EXACT JSON structure below:

{{
  "diet_recommendations": {{
    "add": ["short suggestions, no commas inside strings"],
    "reduce": ["short suggestions"],
    "pairings": ["specific food combos"],
    "overall_comment": "one concise sentence only"
  }}
}}
"""
