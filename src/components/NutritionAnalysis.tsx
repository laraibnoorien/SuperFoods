import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_URL = "http://localhost:8000/analyze";

type Macros = {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
};

type Micronutrients = Record<string, number>;

type DietRecommendations = {
  add?: string[];
  reduce?: string[];
  pairings?: string[];
  overall_comment?: string;
};

type NutritionResponse = {
  detected_food?: string[];
  estimated_calories?: number;
  macros?: Macros;
  micronutrients?: Micronutrients;
  diet_recommendations?: DietRecommendations;
  glycemic_index?: number;
  diet_suitability?: Record<string, string>;
  overall_comment?: string;
  health_score?: number;
  missing_nutrients?: string[];
  image_with_boxes?: string | null;
};

const CONDITIONS = [
  { value: "diabetic", label: "Diabetic" },
  { value: "high_cholesterol", label: "High Cholesterol" },
  { value: "fatigue", label: "Fatigue" },
  { value: "high_bp", label: "High BP" },
  { value: "low_bp", label: "Low BP" },
  { value: "sick", label: "Sick Recovery" },
  { value: "stress", label: "High Stress" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "pregnant", label: "Pregnant" },
];

const labelColor = (s: number) =>
  s >= 70 ? "text-emerald-400" : s >= 45 ? "text-yellow-400" : "text-red-400";

const ringColor = (s: number) =>
  s >= 70 ? "stroke-emerald-400" : s >= 45 ? "stroke-yellow-400" : "stroke-red-400";

const giBadge = (gi: number | undefined) => {
  if (gi === undefined || Number.isNaN(gi)) return { label: "Unknown", className: "bg-neutral-800 text-gray-300" };
  if (gi <= 55) return { label: "Low GI", className: "bg-emerald-500/20 text-emerald-300" };
  if (gi <= 69) return { label: "Medium GI", className: "bg-yellow-500/20 text-yellow-300" };
  return { label: "High GI", className: "bg-red-500/20 text-red-300" };
};

const NutritionAnalysis = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [portion, setPortion] = useState("1.0");
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("indian");
  const [nutritionData, setNutritionData] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
    setNutritionData(null);
    setFinalImage(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    setFinalImage(null);
  };

  const toggleCondition = (value: string) => {
    setConditions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const analyze = async () => {
    if (!imageFile && !textDescription.trim()) {
      return alert("Upload an image or describe the food!");
    }

    setLoading(true);

    const applied = [...conditions];
    if (customCondition.trim()) applied.push(customCondition.trim());

    const fd = new FormData();
    if (imageFile) fd.append("file", imageFile);
    fd.append("portion", portion);
    fd.append("conditions", applied.join(","));
    fd.append("description", textDescription.trim());
    fd.append("model_type", selectedModel);

    try {
      const res = await fetch(API_URL, { method: "POST", body: fd });
      const json: NutritionResponse = await res.json();
      setNutritionData(json || {});
      setFinalImage(json.image_with_boxes ?? null);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const data = nutritionData ?? {};
  const macros = data.macros ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
  const micros = data.micronutrients ?? {};
  const score = data.health_score ?? 0;
  const giInfo = giBadge(data.glycemic_index);

  const suggestions: string[] = [];
  const cal = data.estimated_calories ?? 0;
  if (macros.protein_g < 15) suggestions.push("Add more protein.");
  if (macros.fat_g > 25) suggestions.push("Lower unhealthy fats.");
  if (cal > 650) suggestions.push("Control calories by reducing portion.");

  if (suggestions.length === 0) suggestions.push("Well-balanced meal!");

  return (
    <div className="min-h-screen bg-black text-gray-100">

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="h-40 w-40 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-emerald-300 mt-4">Analyzing...</span>
        </div>
      )}

      <div className="container mx-auto p-8 grid gap-10 lg:grid-cols-[1.2fr,1fr]">

        {/* LEFT */}
        <div className="space-y-8">
          {nutritionData && (
            <Card className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">

              {/* Score + Energy */}
              <div className="flex items-center gap-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="42" strokeWidth="10" fill="none" className="stroke-neutral-800" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      strokeDasharray={`${(score / 100) * 264}, 264`}
                      className={ringColor(score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${labelColor(score)}`}>{score}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Health Score</span>
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p>Calories: <strong>{cal}</strong> kcal</p>
                  <span className={`px-3 py-1 rounded-full text-[11px] ${giInfo.className}`}>
                    {giInfo.label}
                  </span>
                </div>
              </div>

              {/* Macros */}
              <div>
                <p className="uppercase text-xs text-gray-500 mb-2">Macronutrients</p>
                {Object.entries(macros).map(([k, v]) => (
                  <div key={k} className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>{k.replace("_g", "")}</span>
                      <span>{v} g</span>
                    </div>
                    <Progress value={v} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Micronutrients */}
              <div>
                <p className="uppercase text-xs text-gray-500 mb-2">Micronutrients</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(micros).map(([k, v]) => {
                    let unit = "";
                    if (k.endsWith("_mg")) unit = "mg";
                    else if (k.endsWith("_mcg")) unit = "mcg";
                    else if (k.endsWith("_g")) unit = "g";

                    const clean = k
                      .replace(/_(mg|mcg|g)$/, "")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <div key={k} className="bg-neutral-800 p-2 rounded">
                        {clean}: {v} {unit}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing */}
              {!!data.missing_nutrients?.length && (
                <div>
                  <p className="text-xs uppercase text-amber-400 mb-1">Missing Nutrients</p>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_nutrients.map((n, i) => (
                      <span key={i} className="px-2 py-1 bg-amber-500/20 rounded text-amber-200 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ⭐ Diet Recommendations */}
              {data.diet_recommendations && (
                <Card className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-4">

                  {data.diet_recommendations.add?.length ? (
                    <div>
                      <p className="text-base text-emerald-400 font-semibold">Add</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.diet_recommendations.add.map((item, i) => (
                          <span key={i} className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {data.diet_recommendations.reduce?.length ? (
                    <div>
                      <p className="text-base text-red-400 font-semibold">Reduce</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.diet_recommendations.reduce.map((item, i) => (
                          <span key={i} className="text-xs px-3 py-1 bg-red-500/20 text-red-300 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {data.diet_recommendations.pairings?.length ? (
                    <div>
                      <p className="text-base text-blue-400 font-semibold">Pairings</p>
                      <ul className="text-xs space-y-1 text-gray-300 mt-2">
                        {data.diet_recommendations.pairings.map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {data.diet_recommendations.overall_comment && (
                    <p className="text-xs text-gray-300 italic text-center">
                      {data.diet_recommendations.overall_comment}
                    </p>
                  )}

                </Card>
              )}

              {/* Suggestions */}
              <div className="bg-neutral-800 p-3 rounded-xl">
                <p className="text-emerald-300 text-xs font-semibold mb-1">Suggestions</p>
                <ul className="text-xs space-y-1">
                  {suggestions.map((s, i) => (
                    <li key={i}>✔ {s}</li>
                  ))}
                </ul>
              </div>

            </Card>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          <Card className="bg-neutral-900 p-4 border border-neutral-800 rounded-xl flex items-center justify-center h-64">
            {preview ? (
              <div className="relative h-full w-full">
                <img src={preview} className="w-full h-full rounded-xl object-cover" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-red-600 text-xs px-2 py-1 rounded">
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center text-gray-400 cursor-pointer gap-2">
                <Upload className="w-10 h-10 text-emerald-400" />
                Upload Food Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </Card>

          {finalImage && (
            <Card className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <img src={`data:image/jpeg;base64,${finalImage}`} className="rounded-xl object-contain" />
            </Card>
          )}

          <Card className="bg-neutral-900 p-6 border border-neutral-800 rounded-xl space-y-4">

            <div>
              <p className="text-xs uppercase text-gray-400">Portion Size</p>
              <input
                className="bg-neutral-800 border border-neutral-700 p-2 rounded-lg w-full"
                type="number"
                min="0.1"
                step="0.1"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
              />
            </div>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 p-2 rounded-lg w-full"
            >
              <option value="indian">Indian</option>
              <option value="western">Western</option>
              <option value="auto">Auto</option>
            </select>

            <textarea
              className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg w-full text-sm"
              placeholder="Describe food"
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
            />

            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Conditions</p>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleCondition(c.value)}
                    className={`px-3 py-1 rounded-xl text-[11px] ${
                      conditions.includes(c.value)
                        ? "bg-emerald-600 text-black"
                        : "bg-neutral-900 border border-emerald-300/40 text-emerald-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              placeholder="Custom condition"
              className="bg-neutral-800 border border-neutral-700 p-3 rounded-xl w-full text-sm"
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
            />

            <Button onClick={analyze} className="bg-emerald-500 text-black w-full py-3 rounded-xl font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Meal"}
            </Button>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalysis;
