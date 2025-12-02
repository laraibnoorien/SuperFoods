import { useState } from "react";
import {
  ChefHat,
  XCircle,
  RefreshCcw,
  Wand2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Ingredient = {
  name: string;
  qty: string;
};

type Recipe = {
  title: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  nutrition?: {
    estimated_calories?: number;
  };
};

type ReplacementOption = {
  name: string;
  reason: string;
};

const API_BASE = "http://127.0.0.1:8000";

// Preferences options (multi-select)
const PREFERENCE_OPTIONS: { id: string; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal (no pork/gelatin/alcohol)" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "chicken", label: "Prefers chicken" },
  { id: "fish", label: "Prefers fish" },
  { id: "beef", label: "Prefers beef" },
  { id: "lamb", label: "Prefers lamb" },
];

const RecipeGenerator = () => {
  const [dish, setDish] = useState("");
  const [servings, setServings] = useState("2");

  const [preferences, setPreferences] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingReplace, setLoadingReplace] = useState(false);

  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);
  const [replacementOptions, setReplacementOptions] = useState<ReplacementOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const togglePreference = (id: string, checked: boolean | string) => {
    const on = checked === true;
    setPreferences((prev) =>
      on ? [...prev, id] : prev.filter((p) => p !== id)
    );
  };

  const handleGenerate = async () => {
    if (!dish.trim()) {
      setError("Please enter a dish name.");
      return;
    }
    setError(null);
    setLoadingGenerate(true);
    setRecipe(null);
    setReplaceTarget(null);
    setReplacementOptions([]);

    try {
      const resp = await fetch(`${API_BASE}/api/recipe/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dish,
          servings: Number(servings) || 2,
          preferences,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Generate error:", text);
        setError("Failed to generate recipe.");
        return;
      }

      const data = await resp.json();
      setRecipe(data);
    } catch (err) {
      console.error(err);
      setError("Network error while generating recipe.");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleRemoveIngredient = async (ingredientName: string) => {
    if (!recipe) return;
    setError(null);
    setLoadingUpdate(true);
    setReplaceTarget(null);
    setReplacementOptions([]);

    try {
      const resp = await fetch(`${API_BASE}/api/recipe/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe,
          excluded_items: [ingredientName],
          added_items: [],
          preferences,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Update error:", text);
        setError("Failed to update recipe.");
        return;
      }

      const data = await resp.json();
      setRecipe(data);
    } catch (err) {
      console.error(err);
      setError("Network error while updating recipe.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleOpenReplace = async (ingredientName: string) => {
    if (!recipe) return;
    setError(null);
    setLoadingReplace(true);
    setReplaceTarget(ingredientName);
    setReplacementOptions([]);

    try {
      const resp = await fetch(`${API_BASE}/api/recipe/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_name: ingredientName,
          recipe,
          preferences,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Replace error:", text);
        setError("Failed to fetch replacement suggestions.");
        return;
      }

      const data = await resp.json();
      const opts: ReplacementOption[] = data.replacements || [];
      setReplacementOptions(opts);
    } catch (err) {
      console.error(err);
      setError("Network error while fetching replacements.");
    } finally {
      setLoadingReplace(false);
    }
  };

  const handleApplyReplacement = async (oldName: string, newName: string) => {
    if (!recipe) return;
    setError(null);
    setLoadingUpdate(true);

    // Try to reuse qty from old ingredient
    const oldIng = recipe.ingredients.find((i) => i.name === oldName);
    const qty = oldIng?.qty || "to taste";

    try {
      const resp = await fetch(`${API_BASE}/api/recipe/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe,
          excluded_items: [oldName],
          added_items: [{ name: newName, qty }],
          preferences,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Apply replacement error:", text);
        setError("Failed to apply replacement.");
        return;
      }

      const data = await resp.json();
      setRecipe(data);
      setReplaceTarget(null);
      setReplacementOptions([]);
    } catch (err) {
      console.error(err);
      setError("Network error while applying replacement.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleReset = () => {
    setDish("");
    setServings("2");
    setRecipe(null);
    setPreferences([]);
    setReplaceTarget(null);
    setReplacementOptions([]);
    setError(null);
  };

  const selectedPrefLabel =
    preferences.length === 0
      ? "No preferences"
      : `${preferences.length} selected`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white p-6">
      {/* Radial emerald glow behind UI */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-emerald-400 mb-1">
            Smart Personal Recipe Generator
          </h2>
          <p className="text-gray-300 text-sm md:text-base">
            Generate, customize, and tweak recipes with ingredient removal, replacements, and dietary preferences.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Inputs + Preferences */}
          <Card className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>Dish & Preferences</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter what you want to cook and how you prefer it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-200">Dish Name</Label>
                <Input
                  placeholder="e.g. Pancakes, Butter Chicken, Veg Pulao"
                  className="mt-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-gray-200">Servings</Label>
                <Input
                  placeholder="2"
                  className="mt-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>

              {/* Preferences dropdown (collapsible checklist) */}
              <div className="space-y-1">
                <Label className="text-gray-200">Preferences</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-neutral-800 border-neutral-700 text-gray-200 hover:bg-neutral-700"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-emerald-400" />
                        <span>{selectedPrefLabel}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Open
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-neutral-900 border border-neutral-700 text-white">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {PREFERENCE_OPTIONS.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={opt.id}
                            checked={preferences.includes(opt.id)}
                            onCheckedChange={(checked) =>
                              togglePreference(opt.id, checked)
                            }
                          />
                          <Label
                            htmlFor={opt.id}
                            className="text-sm text-gray-200 cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">
                  You can combine options, e.g. <span className="text-emerald-400">halal + chicken</span> or <span className="text-emerald-400">vegan + gluten-free</span>.
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loadingGenerate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
              >
                <ChefHat className="mr-2 w-4 h-4" />
                {loadingGenerate ? "Generating..." : "Generate Recipe"}
              </Button>
            </CardContent>
          </Card>

          {/* Right: Recipe Display */}
          <Card className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-xl md:row-span-2">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>Recipe</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Remove or replace ingredients; steps will be updated by the backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!recipe ? (
                <div className="text-center py-10 text-gray-500">
                  <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-60" />
                  <p>Enter a dish and preferences, then generate a recipe.</p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-2xl font-semibold text-emerald-400">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Servings: {recipe.servings} · Calories:{" "}
                      {recipe.nutrition?.estimated_calories ?? "N/A"} kcal
                    </p>
                  </div>

                  {/* Ingredients list with Remove + Replace */}
                  <div className="space-y-2">
                    <h4 className="text-lg text-gray-200">Ingredients</h4>
                    <div className="space-y-2">
                      {recipe.ingredients.map((ing) => (
                        <div
                          key={ing.name}
                          className="flex items-center justify-between gap-2"
                        >
                          <Badge className="bg-neutral-800 border border-emerald-500 text-emerald-300 px-3 py-1">
                            {ing.qty} {ing.name}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-emerald-400 hover:text-emerald-300"
                              title="Replace"
                              onClick={() =>
                                handleOpenReplace(ing.name)
                              }
                              disabled={loadingReplace || loadingUpdate}
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-400"
                              title="Remove"
                              onClick={() =>
                                handleRemoveIngredient(ing.name)
                              }
                              disabled={loadingUpdate}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Replacement suggestions panel */}
                  {replaceTarget && (
                    <div className="space-y-2 p-3 border border-emerald-600 rounded-lg bg-neutral-800">
                      <p className="text-sm text-gray-200">
                        Replacement suggestions for{" "}
                        <span className="text-emerald-400 font-semibold">
                          {replaceTarget}
                        </span>
                        :
                      </p>

                      {loadingReplace && (
                        <p className="text-xs text-gray-400">
                          Fetching suggestions...
                        </p>
                      )}

                      {!loadingReplace && replacementOptions.length === 0 && (
                        <p className="text-xs text-gray-500">
                          No suggestions yet. Try another ingredient.
                        </p>
                      )}

                      <div className="space-y-1">
                        {replacementOptions.map((opt) => (
                          <div
                            key={opt.name}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <div className="text-gray-200">
                              <span className="text-emerald-400 font-semibold">
                                {opt.name}
                              </span>{" "}
                              <span className="text-gray-400">
                                — {opt.reason}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-xs"
                              onClick={() =>
                                handleApplyReplacement(
                                  replaceTarget,
                                  opt.name
                                )
                              }
                              disabled={loadingUpdate}
                            >
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="space-y-2">
                    <h4 className="text-lg text-gray-200">Steps</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      {recipe.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <Button
                    onClick={handleReset}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-200"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeGenerator;
