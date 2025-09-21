import { useState } from "react";
import { Upload, BarChart3, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const NutritionAnalysis = () => {
  const [nutritionData, setNutritionData] = useState<{
    dishName: string;
    calories: number;
    macros: { protein: number; carbs: number; fats: number; };
    micros: { vitamin_c: number; iron: number; calcium: number; };
  } | null>(null);

  const handleAnalysis = () => {
    // Simulate nutrition API call
    setTimeout(() => {
      setNutritionData({
        dishName: "Grilled Chicken Salad",
        calories: 385,
        macros: { protein: 35, carbs: 12, fats: 18 },
        micros: { vitamin_c: 45, iron: 15, calcium: 8 }
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Nutrition Analysis</h2>
        <p className="text-muted-foreground">Upload a dish image to get detailed nutritional information</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Analyze Your Dish</CardTitle>
          <CardDescription className="text-center">
            Get calories, macros, and micronutrients instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="upload" size="lg" onClick={handleAnalysis} className="w-full h-32">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8" />
              <span>Upload Dish Image</span>
              <span className="text-xs text-muted-foreground">AI-powered nutrition detection</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {nutritionData && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>{nutritionData.dishName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Calories */}
                <Card className="bg-gradient-nutrition text-accent-foreground">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{nutritionData.calories}</div>
                    <div className="text-sm opacity-90">Calories</div>
                  </CardContent>
                </Card>

                {/* Macronutrients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Macronutrients (g)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Protein</span>
                        <span>{nutritionData.macros.protein}g</span>
                      </div>
                      <Progress value={nutritionData.macros.protein} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Carbs</span>
                        <span>{nutritionData.macros.carbs}g</span>
                      </div>
                      <Progress value={nutritionData.macros.carbs} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fats</span>
                        <span>{nutritionData.macros.fats}g</span>
                      </div>
                      <Progress value={nutritionData.macros.fats} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Micronutrients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Value %</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vitamin C</span>
                        <span>{nutritionData.micros.vitamin_c}%</span>
                      </div>
                      <Progress value={nutritionData.micros.vitamin_c} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Iron</span>
                        <span>{nutritionData.micros.iron}%</span>
                      </div>
                      <Progress value={nutritionData.micros.iron} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Calcium</span>
                        <span>{nutritionData.micros.calcium}%</span>
                      </div>
                      <Progress value={nutritionData.micros.calcium} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NutritionAnalysis;