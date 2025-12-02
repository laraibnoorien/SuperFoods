# backend/recipe_pipeline.py

from typing import List, Dict
from llm_client import call_llm
from recipe_prompt import (
    build_recipe_prompt,
    build_adjust_recipe_prompt,
    build_replacement_prompt,
)


# Filter unsafe ingredients based on preferences
def filter_restricted_ingredients(preferences: List[str], ingredients: List[Dict]) -> List[Dict]:
    restricted = []

    # Halal rules: exclude pork, alcohol, gelatin
    if "halal" in preferences:
        restricted.extend([
            "pork", "bacon", "gelatin", "beer", "wine", "rum",
            "ham", "lard", "sausage", "pepperoni"
        ])

    # Vegetarian: exclude all meat and fish
    if "vegetarian" in preferences:
        restricted.extend(["chicken", "beef", "fish", "lamb", "shrimp", "egg"])

    # Vegan: exclude all as above + dairy + honey
    if "vegan" in preferences:
        restricted.extend(["milk", "cheese", "butter", "yogurt", "cream", "egg", "honey"])

    # Custom preference exclusions
    restriction_map = {
        "chicken": ["beef", "fish", "lamb", "pork"],
        "beef": ["chicken", "fish", "lamb", "pork"],
        "fish": ["chicken", "beef", "lamb", "pork"],
        "lamb": ["chicken", "beef", "fish", "pork"],
    }

    for pref in preferences:
        restricted.extend(restriction_map.get(pref, []))

    restricted = [r.lower() for r in restricted]

    # Filter restricted ingredients
    return [
        i for i in ingredients
        if i["name"].lower() not in restricted
    ]


def generate_recipe(dish: str, servings: int, preferences: List[str]) -> Dict:
    print("GEN REQ:", dish, servings, preferences)

    response = call_llm(build_recipe_prompt(dish, servings, preferences))

    # If valid dict → use it
    if isinstance(response, dict) and "ingredients" in response:
        response["ingredients"] = filter_restricted_ingredients(
            preferences, response.get("ingredients", [])
        )
        response["nutrition"] = {}
        return response

    # ⚠️ Fallback: LLM returned empty OR invalid JSON
    print("⚠️ LLM FAILED — returning fallback recipe")
    return {
        "title": dish.capitalize(),
        "servings": servings,
        "ingredients": [{"name": "water", "qty": "1 cup"}],
        "steps": [
            f"LLM could not generate details for '{dish}'.",
            f"Try removing some preferences or use a simpler dish name 😅",
        ],
        "nutrition": {},
    }



def adjust_recipe(recipe: Dict, excluded_items: List[str], added_items: List[Dict], preferences: List[str]):
    # Remove excluded ingredients
    updated_ingredients = [
        i for i in recipe["ingredients"] if i["name"] not in excluded_items
    ] + added_items

    updated_ingredients = filter_restricted_ingredients(preferences, updated_ingredients)

    cleaned_recipe = recipe.copy()
    cleaned_recipe["ingredients"] = updated_ingredients

    # LLM rewrite of steps
    prompt = build_adjust_recipe_prompt(cleaned_recipe, excluded_items, added_items, preferences)
    llm_output = call_llm(prompt)

    if isinstance(llm_output, dict):
        llm_output["nutrition"] = {}
        return llm_output

    # fallback step rewrite
    cleaned_recipe["steps"] = [
        step for step in recipe["steps"]
        if not any(item.lower() in step.lower() for item in excluded_items)
    ]
    cleaned_recipe["nutrition"] = {}
    print("LLM FAILED — fallback step rewrite")
    return cleaned_recipe


def suggest_replacement(ingredient_name: str, recipe: Dict, preferences: List[str], removed_items: List[str]):
    prompt = build_replacement_prompt(
        ingredient_name=ingredient_name,
        recipe=recipe,
        preferences=preferences,
        removed_items=removed_items,
    )

    replacements = call_llm(prompt)

    if not isinstance(replacements, dict):
        return {
            "ingredient": ingredient_name,
            "replacements": [{"name": "None", "reason": "No valid alternatives"}]
        }

    return replacements
