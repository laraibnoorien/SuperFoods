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
    <div className="space-y-8 min-h-screen bg-black p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">
          Nutrition Analysis
        </h2>
        <p className="text-gray-400">
          Upload a dish image to get detailed nutritional information
        </p>
      </div>

      {/* Upload Card */}
      <Card className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-white">Analyze Your Dish</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Get calories, macros, and micronutrients instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleAnalysis}
            className="w-full h-32 bg-neutral-950 border border-emerald-600 text-gray-200 hover:bg-emerald-900 flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-8 h-8 text-emerald-400" />
            <span>Upload Dish Image</span>
            <span className="text-xs text-gray-400">AI-powered nutrition detection</span>
          </Button>
        </CardContent>
      </Card>

      {/* Nutrition Results */}
      {nutritionData && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>{nutritionData.dishName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Calories */}
                <Card className="bg-emerald-900 text-black rounded-xl shadow-inner">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    <div className="text-3xl font-bold">{nutritionData.calories}</div>
                    <div className="text-sm opacity-90">Calories</div>
                  </CardContent>
                </Card>

                {/* Macronutrients */}
                <Card className="bg-neutral-950 text-white rounded-xl shadow-inner">
                  <CardHeader>
                    <CardTitle className="text-lg">Macronutrients (g)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(nutritionData.macros).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1 capitalize">
                          <span>{key}</span>
                          <span>{value}g</span>
                        </div>
                        <Progress value={value} className="h-2 bg-neutral-800 progress-emerald" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Micronutrients */}
                <Card className="bg-neutral-950 text-white rounded-xl shadow-inner">
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Value %</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(nutritionData.micros).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1 capitalize">
                          <span>{key.replace("_", " ")}</span>
                          <span>{value}%</span>
                        </div>
                        <Progress value={value} className="h-2 bg-neutral-800 progress-emerald" />
                      </div>
                    ))}
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
