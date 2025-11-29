import { useState } from "react";
import { Upload, BarChart3, Zap, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_URL = "http://localhost:8000/analyze";

type Macros = { protein_g: number; carbs_g: number; fat_g: number };

type DietRecommendations = {
  add: string[];
  reduce: string[];
  overall_comment: string;
};

type NutritionResponse = {
  detected_food: string[];
  estimated_calories: number;
  macros: Macros;
  diet_recommendations: DietRecommendations;
};

const CONDITIONS = [
  { value: "diabetic", label: "Diabetic" },
  { value: "high_bp", label: "High BP" },
  { value: "sick", label: "Sick / Recovery" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
];

const computeHealthyScore = (data: NutritionResponse): number => {
  const { estimated_calories: cal, macros } = data;
  let score = 100;

  if (cal > 900) score -= 45;
  else if (cal > 750) score -= 35;
  else if (cal > 600) score -= 25;
  else if (cal > 450) score -= 15;
  else if (cal < 250) score -= 10;

  const total = macros.protein_g + macros.carbs_g + macros.fat_g;
  const pRatio = macros.protein_g / total;
  const fRatio = macros.fat_g / total;

  if (pRatio >= 0.2 && pRatio <= 0.4) score += 5;
  else score -= 5;
  if (fRatio > 0.4) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const gaugeRingColor = (score: number): string => {
  if (score >= 70) return "stroke-emerald-400";
  if (score >= 45) return "stroke-yellow-400";
  return "stroke-red-400";
};

const labelColor = (score: number): string => {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
};

const NutritionAnalysis = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [portion, setPortion] = useState("1.0");
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [nutritionData, setNutritionData] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleCondition = (value: string) => {
    setConditions(prev => prev.includes(value)
      ? prev.filter(c => c !== value)
      : [...prev, value]);
  };

  const handleAnalysis = async () => {
    if (!imageFile) return alert("Upload image first!");
    setLoading(true);

    const finalConditions = [...conditions];
    if (customCondition.trim()) finalConditions.push(customCondition.trim());

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("portion", portion);
    formData.append("conditions", finalConditions.join(","));

    try {
      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      const data: NutritionResponse = await res.json();
      setNutritionData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image — see console.");
    } finally {
      setLoading(false);
    }
  };

  const score = nutritionData ? computeHealthyScore(nutritionData) : 0;

  return (
    <div className="space-y-8 min-h-screen bg-black p-6 relative">

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning donut */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-2 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing your meal…
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-emerald-400">Food Nutrition Analyzer</h2>
        <p className="text-gray-400">Upload your food and get smart nutrition insights</p>
      </div>

      {/* Input Card */}
      <Card className="bg-neutral-900 border border-neutral-700 max-w-5xl mx-auto rounded-3xl p-6 space-y-6">
        <CardTitle className="text-white text-lg text-center">Meal Input</CardTitle>

        {/* Image input */}
        <div className="flex flex-col gap-4">
          {preview ? (
            <div className="relative">
              <img src={preview} className="rounded-2xl shadow-lg border border-neutral-800 max-h-72 w-full object-cover" />
              <Button
                size="sm"
                className="absolute top-3 right-3 bg-black/70 hover:bg-black/90"
                onClick={() => {
                  setImageFile(null);
                  setPreview(null);
                  setNutritionData(null);
                }}
              >Clear</Button>
            </div>
          ) : (
            <label className="h-48 border border-dashed border-emerald-600 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-neutral-800/40">
              <Upload className="w-10 h-10 mb-2 text-emerald-300" />
              Click to upload food photo
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Portion */}
          <div>
            <p className="text-gray-300 text-sm mb-1">Portion Size</p>
            <input
              type="number"
              min="0.1" step="0.1"
              value={portion}
              onChange={e => setPortion(e.target.value)}
              className="bg-neutral-800 text-white w-full p-2 rounded-lg"
            />
          </div>

          {/* Condition chips */}
          <div>
            <p className="text-gray-300 text-sm mb-1">Health Conditions</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c.value}
                  type="button"
                  onClick={() => toggleCondition(c.value)}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    conditions.includes(c.value)
                      ? "bg-emerald-600 text-white"
                      : "border-emerald-500 text-emerald-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom condition */}
          <input
            placeholder="Other condition (optional)"
            className="bg-neutral-800 text-gray-200 border border-neutral-700 rounded-lg p-2"
            value={customCondition}
            onChange={e => setCustomCondition(e.target.value)}
          />
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAnalysis}>
          Analyze Meal
        </Button>
      </Card>

      {/* Results */}
      {nutritionData && (
        <Card className="bg-neutral-900 border border-neutral-800 max-w-5xl mx-auto rounded-3xl shadow-xl mt-6 p-6">
          <div className="grid md:grid-cols-[1.3fr,1fr] gap-6">
            {/* Left */}
            <div className="space-y-6">
              {/* Calories */}
              <div className="bg-neutral-950 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Energy</p>
                  <p className="text-4xl font-bold text-white">
                    {nutritionData.estimated_calories}
                    <span className="text-sm text-gray-500 ml-1">kcal</span>
                  </p>
                </div>
                <Zap className="w-10 h-10 text-emerald-400" />
              </div>

              {/* Macros */}
              <div className="bg-neutral-950 p-5 rounded-2xl space-y-4">
                <p className="text-sm text-gray-300 font-semibold">Macronutrients</p>
                {Object.entries(nutritionData.macros).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-gray-300 text-xs mb-1 capitalize">
                      <span>{k.replace("_g", "")}</span>
                      <span>{v} g</span>
                    </div>
                    <Progress value={v as number} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="bg-neutral-950 p-5 rounded-2xl space-y-3">
                <p className="text-sm font-semibold text-gray-300">Diet Suggestions</p>
                <p className="text-emerald-400 text-xs font-medium">
                  {nutritionData.diet_recommendations.overall_comment}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    ➕ <strong>Add</strong>
                    <ul className="list-disc ml-4 text-gray-300 mt-1">
                      {nutritionData.diet_recommendations.add.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>

                  <div>
                    ➖ <strong className="text-red-400">Reduce</strong>
                    <ul className="list-disc ml-4 text-red-300 mt-1">
                      {nutritionData.diet_recommendations.reduce.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Healthy Score */}
            <div className="bg-neutral-950 p-6 rounded-2xl flex flex-col items-center justify-center">
              <p className="text-gray-400 tracking-wide text-xs mb-2">Healthy Score</p>

              <div className="relative w-40 h-40 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" strokeWidth="10" fill="none" className="stroke-neutral-800" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 264}, 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className={gaugeRingColor(score)}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${labelColor(score)}`}>{score}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Based on calories + macro balance
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NutritionAnalysis;
