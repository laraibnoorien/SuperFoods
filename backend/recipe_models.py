# backend/recipe_models.py

from pydantic import BaseModel
from typing import List, Dict, Optional


class Ingredient(BaseModel):
    name: str
    qty: str        # e.g. "200 g", "1 cup"
    calories: Optional[float] = None  # optional, you can fill from nutrition API


class Recipe(BaseModel):
    title: str
    servings: int
    ingredients: List[Ingredient]
    steps: List[str]
    nutrition: Dict[str, float] = {}  # { "calories": ..., "protein_g": ... }


class RecipeGenerateRequest(BaseModel):
    dish: str
    servings: int = 2
    preferences: List[str] = []  # ["vegan", "high protein", "gluten free"] etc.


class RecipeUpdateRequest(BaseModel):
    recipe: Recipe
    excluded_items: List[str] = []       # ingredient names to remove
    added_items: List[Ingredient] = []   # new ingredients user wants to add
    preferences: List[str] = []


class RecipeReplaceRequest(BaseModel):
    recipe: Recipe
    ingredient_name: str
    preferences: List[str] = []


class RecipeSaveRequest(BaseModel):
    recipe: Recipe
    user_id: Optional[str] = None
