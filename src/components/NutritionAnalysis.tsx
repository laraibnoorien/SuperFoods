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

type Micronutrients = {
  iron_mg: number;
  calcium_mg: number;
  magnesium_mg: number;
  potassium_mg: number;
  vitamin_c_mg?: number;
  vitamin_b12_mcg?: number;
};

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
  if (gi === undefined || Number.isNaN(gi)) {
    return { label: "Unknown GI", className: "bg-neutral-800 text-gray-300" };
  }
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
      return alert("Upload an image or describe the food first.");
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

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend Error:", errText);
        alert("Server error. Check console.");
        setLoading(false);
        return;
      }

      const json: NutritionResponse = await res.json();
      setNutritionData(json || {});
      setFinalImage(json.image_with_boxes ?? null);
    } catch (err) {
      console.error(err);
      alert("Network error. Check console.");
    }

    setLoading(false);
  };

  const data = nutritionData ?? {};
  const macros = data.macros ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
  const micros = data.micronutrients ?? {};
  const score = data.health_score ?? 0;
  const giInfo = giBadge(data.glycemic_index);

  // Simple frontend “smart” hints (backend is still the source of truth)
  const smartSuggestions: string[] = [];
  const cal = data.estimated_calories ?? 0;

  if (macros.protein_g < 15) smartSuggestions.push("Increase protein: add yogurt, paneer, eggs, lentils.");
  if (macros.carbs_g > macros.protein_g * 3) smartSuggestions.push("Reduce refined carbs; add vegetables or lean protein.");
  if (macros.fat_g > 25) smartSuggestions.push("Prefer grilled/steamed options over fried ones.");
  if (cal > 650) smartSuggestions.push("Consider reducing portion size for energy control.");

  if (conditions.includes("diabetic")) smartSuggestions.push("Prioritize fiber and low-GI carbs to manage blood sugar.");
  if (conditions.includes("high_bp")) smartSuggestions.push("Limit added salt; include potassium-rich foods like bananas and spinach.");
  if (conditions.includes("high_cholesterol")) smartSuggestions.push("Reduce saturated fat; prefer pulses, fish, and whole grains.");
  if (smartSuggestions.length === 0) smartSuggestions.push("Looks balanced from the visible macros.");

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_70%)]" />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-300" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-10 py-20 grid xl:grid-cols-[1.2fr,1fr] lg:grid-cols-2 gap-12">

        {/* LEFT: RESULTS + RECOMMENDATIONS */}
        <div className="space-y-8">
          <div>
            <h1 className="text-6xl font-serif italic tracking-tight">Nutrition Scan</h1>
            <p className="text-gray-400 text-sm mt-2">Smart insights. Better choices.</p>
          </div>

          {/* Top row: Score + GI badge */}
          {nutritionData && (
            <Card className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
              {/* Donut chart */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="10"
                    fill="none"
                    className="stroke-neutral-800"
                  />
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
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Health Score
                  </span>
                </div>
              </div>

              {/* Textual summary */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-500 uppercase">Energy</p>
                  <p className="text-3xl font-bold">
                    {data.estimated_calories ?? 0}
                    <span className="text-sm text-gray-400 ml-1">kcal</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase">Glycemic Index</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold ${giInfo.className}`}
                  >
                    {giInfo.label}
                    {data.glycemic_index !== undefined &&
                      ` (${Math.round(data.glycemic_index)})`}
                  </span>
                </div>

                {data.overall_comment && (
                  <p className="text-xs text-gray-300 italic mt-1">
                    {data.overall_comment}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Macros */}
          {nutritionData && (
            <Card className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-3">
              <p className="text-xs text-gray-500 uppercase mb-2">Macronutrients</p>
              <div className="space-y-3">
                {Object.entries(macros).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm capitalize">
                      <span>{k.replace("_g", "")}</span>
                      <span>{v} g</span>
                    </div>
                    <Progress value={v} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Micronutrients + Missing */}
          {nutritionData && (
            <Card className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <p className="text-xs text-gray-500 uppercase">Micronutrients</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(micros).map(([key, v]) => (
                  <div key={key} className="bg-neutral-800 p-2.5 rounded capitalize">
                    {key.replace("_mg", "").replace("_mcg", "")}: {v as number}
                    {key.includes("_mg")
                      ? " mg"
                      : key.includes("_mcg")
                      ? " mcg"
                      : ""}
                  </div>
                ))}
              </div>

              {/* Top Missing Nutrients */}
              {!!data.missing_nutrients?.length && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Top Missing Nutrients
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_nutrients.map((n, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 text-[11px]"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Diet Recommendations (Add / Reduce / Pairings) */}
          {data.diet_recommendations && (
            <Card className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-5">
              {data.diet_recommendations.add?.length ? (
                <div>
                  <p className="text-base text-emerald-400 font-semibold">Add</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.diet_recommendations.add.map((item, i) => (
                      <span
                        key={i}
                        className="text-emerald-300 text-xs bg-emerald-500/20 rounded-xl px-3 py-1"
                      >
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
                      <span
                        key={i}
                        className="text-red-300 text-xs bg-red-500/20 rounded-xl px-3 py-1"
                      >
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
                <p className="text-xs text-gray-300 italic text-center mt-3">
                  {data.diet_recommendations.overall_comment}
                </p>
              )}
            </Card>
          )}

          {/* Smart Enhancements */}
          {nutritionData && (
            <Card className="bg-neutral-900/80 border border-emerald-400/30 rounded-3xl p-6 space-y-3">
              <p className="text-sm text-emerald-400 font-semibold">
                Smart Meal Enhancements
              </p>
              <ul className="space-y-1 text-xs text-gray-300">
                {smartSuggestions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">✔</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* RIGHT: INPUTS + IMAGES + DETECTED FOOD */}
        <div className="space-y-8">
          {/* Upload / Preview */}
          <Card className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-3xl h-80 flex items-center justify-center">
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} className="rounded-2xl object-cover w-full h-full" />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer">
                <Upload className="w-10 h-10 text-emerald-400" />
                Upload Food Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </Card>

          {/* Annotated image */}
          {finalImage && (
            <Card className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-3xl">
              <p className="text-xs text-gray-400 uppercase mb-2">Detected & Labeled</p>
              <img
                src={`data:image/jpeg;base64,${finalImage}`}
                className="w-full rounded-2xl object-contain"
              />
            </Card>
          )}

          {/* Detected food — taller card */}
          {data.detected_food?.length ? (
            <Card className="bg-neutral-900/70 border border-neutral-800 p-5 rounded-xl space-y-2 min-h-[120px]">
              <p className="text-xs text-gray-400 uppercase">Detected Food</p>
              <div className="flex gap-2 flex-wrap">
                {data.detected_food.map((f, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs bg-emerald-500/20 rounded-xl text-emerald-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Controls for portion / model / description / conditions */}
          <Card className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
            {/* Portion */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Portion Size</p>
              <input
                className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full"
                type="number"
                min="0.1"
                step="0.1"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
              />
            </div>

            {/* Model selector */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Model Type</p>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full"
              >
                <option value="indian">Indian YOLO Model</option>
                <option value="western">Western YOLO Model</option>
                <option value="auto">Auto (Both Models)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Describe Food (optional)</p>
              <textarea
                className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full h-20"
                placeholder="e.g., 2 chapatis, dal, salad, 1 bowl rice"
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
              />
            </div>

            {/* Conditions */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">Health Profile</p>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleCondition(c.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] ${
                      conditions.includes(c.value)
                        ? "bg-gradient-to-r from-emerald-500 to-green-300 text-black font-semibold"
                        : "bg-neutral-900/60 border border-emerald-300/40 text-emerald-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              placeholder="Custom condition"
              className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full text-sm"
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
            />

            <Button
              onClick={analyze}
              className="bg-gradient-to-r from-emerald-500 to-green-300 text-black font-bold w-full py-3 rounded-2xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Meal"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalysis;
