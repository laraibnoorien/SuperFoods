# diet_prompt.py

def nutrition_prompt(labels, portion, conditions):
    return f"""
Only JSON. Estimate real nutrition. Ensure values scale with portion.

Foods: {labels}
Portion Multiplier: {portion}
Conditions: {conditions}

Schema:
{{
  "estimated_calories": number,
  "macros": {{
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number
  }},
  "micronutrients": {{
    "iron_mg": number,
    "calcium_mg": number,
    "magnesium_mg": number,
    "potassium_mg": number,
    "vitamin_c_mg": number,
    "vitamin_b12_mcg": number
  }},
  "glycemic_index": number,
  "diet_suitability": {{
    "diabetic": "safe"|"moderate"|"avoid",
    "high_bp": "safe"|"moderate"|"avoid",
    "high_cholesterol": "safe"|"moderate"|"avoid",
    "weight_loss": "safe"|"moderate"|"avoid"
  }},
  "overall_comment": "string"
}}
"""

def diet_prompt(labels, nutrition, conditions):
    return f"""
Only JSON response. Improve diet balance.

Foods: {labels}
Conditions: {conditions}
Nutrition: {nutrition}

Schema:
{{
  "add": ["foods to improve nutrition"],
  "reduce": ["unhealthy parts"],
  "pairings": ["healthy combinations"],
  "overall_comment": "short advice"
}}
"""
