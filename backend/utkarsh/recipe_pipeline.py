# backend/recipe_pipeline.py

import json
from typing import List, Dict

from llm_client import call_llm
from analysis_pipeline import analyze_nutrition
from recipe_prompt import (
    build_recipe_prompt,
    build_adjust_recipe_prompt,
    build_replacement_prompt,
)


def _extract_json(text: str) -> Dict:
    """
    Try to robustly parse JSON from LLM output.
    Assumes the first '{' to last '}' is the JSON object.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            snippet = text[start : end + 1]
            return json.loads(snippet)
        raise


def _compute_nutrition_for_recipe(recipe: Dict, conditions: List[str]) -> Dict:
    """
    recipe["ingredients"] is a list of { name, qty }.
    We call your existing analyze_nutrition(labels, portion, conditions).
    """
    ingredients = recipe.get("ingredients", [])
    labels = [i["name"] for i in ingredients]
    portions = [i.get("qty", "") for i in ingredients]

    if not labels:
        return {}

    # Your existing diet/nutrition LLM pipeline.
    nutrition_data = analyze_nutrition(labels, portions, conditions) or {}
    # nutrition_data structure depends on your implementation.
    return nutrition_data


def generate_recipe(dish: str, servings: int, preferences: List[str]) -> Dict:
    prompt = build_recipe_prompt(dish, servings, preferences)
    raw = call_llm(prompt)
    if not raw:
        raise RuntimeError("LLM returned empty response for recipe generation.")

    recipe = _extract_json(raw)

    # attach nutrition
    nutrition = _compute_nutrition_for_recipe(recipe, preferences)
    recipe["nutrition"] = nutrition

    return recipe


def adjust_recipe(
    recipe: Dict,
    excluded_items: List[str],
    added_items: List[Dict],
    preferences: List[str],
) -> Dict:
    """
    Pushes the recipe + change instructions to the LLM to get a clean adjusted recipe,
    then recomputes nutrition.
    """
    prompt = build_adjust_recipe_prompt(
        original_recipe=recipe,
        excluded_items=excluded_items,
        added_items=added_items,
        preferences=preferences,
    )

    raw = call_llm(prompt)
    if not raw:
        raise RuntimeError("LLM returned empty response for recipe adjustment.")

    updated_recipe = _extract_json(raw)

    nutrition = _compute_nutrition_for_recipe(updated_recipe, preferences)
    updated_recipe["nutrition"] = nutrition

    return updated_recipe


def suggest_replacement(
    ingredient_name: str,
    recipe: Dict,
    preferences: List[str],
) -> Dict:
    prompt = build_replacement_prompt(
        ingredient_name=ingredient_name,
        recipe=recipe,
        preferences=preferences,
    )

    raw = call_llm(prompt)
    if not raw:
        raise RuntimeError("LLM returned empty response for replacement suggestion.")

    data = _extract_json(raw)
    return data
