import { useState } from "react";
import { ChefHat, Target, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const RecipeGenerator = () => {
  const [preferences, setPreferences] = useState({
    calories: "",
    diet: "",
    servings: "",
  });
  
  const [recipe, setRecipe] = useState<{
    name: string;
    cookTime: number;
    servings: number;
    calories: number;
    ingredients: string[];
    instructions: string[];
    tags: string[];
  } | null>(null);

  const handleGenerate = () => {
    setTimeout(() => {
      setRecipe({
        name: "Mediterranean Quinoa Bowl",
        cookTime: 25,
        servings: 2,
        calories: 420,
        ingredients: [
          "1 cup quinoa",
          "2 cups vegetable broth",
          "1 cucumber, diced",
          "1 cup cherry tomatoes, halved",
          "1/2 red onion, sliced",
          "1/4 cup feta cheese",
          "2 tbsp olive oil",
          "1 lemon, juiced",
          "Fresh herbs (parsley, mint)"
        ],
        instructions: [
          "Rinse quinoa and cook in vegetable broth for 15 minutes",
          "Let quinoa cool completely",
          "Dice cucumber and halve cherry tomatoes",
          "Slice red onion thinly",
          "Combine quinoa with vegetables",
          "Whisk olive oil and lemon juice for dressing",
          "Top with feta cheese and fresh herbs",
          "Serve chilled or at room temperature"
        ],
        tags: ["Vegetarian", "Mediterranean", "High Protein", "Gluten-Free"]
      });
    }, 2000);
  };

  const availableIngredients = [
    "Chicken Breast", "Spinach", "Quinoa", "Tomatoes", "Eggs", 
    "Avocado", "Sweet Potato", "Broccoli", "Salmon", "Rice"
  ];

  return (
    <div className="space-y-8 min-h-screen bg-black p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">
          Recipe Generator
        </h2>
        <p className="text-gray-400">
          Get AI-powered recipes based on your inventory and dietary goals
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Preferences Panel */}
        <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Recipe Preferences</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Set your dietary goals and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calories" className="text-gray-300">Target Calories</Label>
              <Input
                id="calories"
                placeholder="e.g., 500"
                value={preferences.calories}
                onChange={(e) => setPreferences(prev => ({ ...prev, calories: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="diet" className="text-gray-300">Dietary Preference</Label>
              <Select
                onValueChange={(value) => setPreferences(prev => ({ ...prev, diet: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 text-white">
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="servings" className="text-gray-300">Servings</Label>
              <Input
                id="servings"
                placeholder="e.g., 2"
                value={preferences.servings}
                onChange={(e) => setPreferences(prev => ({ ...prev, servings: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300">Available Ingredients</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableIngredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="outline"
                    className="cursor-pointer border-emerald-500 text-emerald-400 hover:bg-emerald-600 hover:text-black"
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleGenerate}
              className="w-full bg-emerald-900 border border-emerald-600 text-emerald-400 hover:bg-emerald-700"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              Generate Recipe
            </Button>
          </CardContent>
        </Card>

        {/* Generated Recipe */}
        <Card className="md:row-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <ChefHat className="w-5 h-5 text-emerald-400" />
              <span>Generated Recipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recipe ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400">{recipe.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{recipe.calories} cal</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-emerald-500 text-emerald-400">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-300">Ingredients:</h4>
                  <ul className="text-sm space-y-1 text-gray-400">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-300">Instructions:</h4>
                  <ol className="text-sm space-y-2 text-gray-400">
                    {recipe.instructions.map((step, index) => (
                      <li key={index}>
                        <span className="font-medium text-emerald-400">{index + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Set your preferences and generate a personalized recipe</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecipeGenerator;
