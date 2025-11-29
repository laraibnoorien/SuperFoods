# diet_prompt.py

from typing import List


def build_prompt(food_items: List[str],
                 portion_size: float,
                 conditions: List[str]) -> str:
    """
    Build a robust prompt to get structured JSON back.
    """

    foods_str = ", ".join(food_items) if food_items else "unknown"
    conditions_str = ", ".join(conditions) if conditions else "none"

    # We request strict JSON output.
    prompt = f"""
You are a clinical nutritionist.

User has eaten a meal detected as: [{foods_str}].
Estimated portion size multiplier: {portion_size} (1.0 means standard portion).

User conditions (if any): [{conditions_str}]
Possible flags include: diabetic, high_bp, sick, weight_loss, weight_gain, etc.

TASKS:
1. Estimate total calories for this meal.
2. Estimate macronutrients: protein (g), carbs (g), fat (g).
3. Briefly describe key nutrients (e.g. fiber, sugar, sodium, vitamins) if relevant.
4. Decide if this meal is appropriate for the user given their conditions.
5. Suggest what should be added or reduced to make this a balanced meal for this specific user.

Return output as **valid JSON only**, no extra text, exactly with this structure:

{{
  "detected_food": {food_items},
  "estimated_calories": 0,
  "macros": {{
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0
  }},
  "notes": {{
    "nutritional_highlights": "",
    "risks_for_conditions": ""
  }},
  "is_meal_appropriate": true,
  "diet_recommendations": {{
    "add": [],
    "reduce": [],
    "overall_comment": ""
  }}
}}

Use realistic estimates based on common values for these foods.
Scale quantities based on portion_size.
"""
    return prompt
