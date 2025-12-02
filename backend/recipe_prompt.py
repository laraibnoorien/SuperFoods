# backend/recipe_prompt.py

import json
from typing import List, Dict


def build_recipe_prompt(dish: str, servings: int, preferences: List[str]) -> str:
    prefs = ", ".join(preferences) if preferences else "none"

    return f"""
You are a professional chef and nutrition-aware recipe developer.

TASK:
Create a recipe for the dish "{dish}" for exactly {servings} servings.
User preferences / constraints: {prefs}.

RECIPE RULES:
- Use common, clear ingredients (no brand names).
- Use quantities in grams, ml, tsp, tbsp, cups etc.
- Make the steps clear and ordered.
- Respect dietary preferences (e.g., vegan: no animal products, etc).

OUTPUT:
Return ONLY a single valid JSON object with this exact schema and nothing else:

{{
  "title": "string",
  "servings": {servings},
  "ingredients": [
    {{"name": "string", "qty": "string"}}
  ],
  "steps": [
    "string"
  ]
}}
"""


def build_adjust_recipe_prompt(
    original_recipe: Dict,
    excluded_items: List[str],
    added_items: List[Dict],
    preferences: List[str]
) -> str:
    prefs = ", ".join(preferences) if preferences else "none"

    return f"""
You are a professional chef. You will MODIFY an existing recipe.

ORIGINAL_RECIPE (JSON):
{json.dumps(original_recipe, ensure_ascii=False)}

INGREDIENTS TO REMOVE (by name):
{json.dumps(excluded_items, ensure_ascii=False)}

INGREDIENTS TO ADD (full JSON objects with name and qty):
{json.dumps(added_items, ensure_ascii=False)}

USER PREFERENCES / CONSTRAINTS:
{prefs}

TASK:
- Remove all excluded ingredients from the recipe.
- Add all added ingredients in a sensible way.
- Update the steps so that they stay consistent with the new ingredient list.
- Keep the same cuisine vibe and make it still taste good.
- Ensure any dietary preferences are respected.

OUTPUT:
Return ONLY a single valid JSON object with the SAME SCHEMA as the original recipe:

{{
  "title": "string",
  "servings": <int>,
  "ingredients": [
    {{"name": "string", "qty": "string"}}
  ],
  "steps": [
    "string"
  ]
}}
"""


def build_replacement_prompt(
    ingredient_name: str,
    recipe: Dict,
    preferences: List[str]
) -> str:
    prefs = ", ".join(preferences) if preferences else "none"

    return f"""
You are a chef and nutrition expert.

The user wants to REPLACE one ingredient in a recipe.

INGREDIENT TO REPLACE:
"{ingredient_name}"

RECIPE (JSON):
{json.dumps(recipe, ensure_ascii=False)}

USER PREFERENCES:
{prefs}

TASK:
Suggest 1-3 good replacements for this ingredient that:
- Keep the dish as close as possible in taste/texture.
- Respect dietary preferences (e.g., vegan, gluten-free, low-calorie, etc).

OUTPUT:
Return ONLY valid JSON with this schema:

{{
  "ingredient": "{ingredient_name}",
  "replacements": [
    {{
      "name": "string",
      "reason": "short explanation why this is a good replacement"
    }}
  ]
}}
"""
