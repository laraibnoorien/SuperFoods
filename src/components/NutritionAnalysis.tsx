import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_URL = "http://localhost:8000/analyze";

type Macros = { protein_g: number; carbs_g: number; fat_g: number };

type DietRecommendations = {
  add?: string[];
  reduce?: string[];
  overall_comment?: string;
};

type NutritionResponse = {
  detected_food?: string[];
  estimated_calories?: number;
  macros?: Macros;
  diet_recommendations?: DietRecommendations;
  // backend may return annotated image (base64) under either of these keys
  image_with_boxes?: string | null;
  annotated_image?: string | null;
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

// Healthy Score Calculation (kept same)
const computeHealthyScore = (data: NutritionResponse): number => {
  const cal = data.estimated_calories ?? 0;
  const m = data.macros ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
  let score = 100;

  if (cal > 900) score -= 45;
  else if (cal > 750) score -= 35;
  else if (cal > 600) score -= 25;
  else if (cal > 450) score -= 15;
  else if (cal < 250) score -= 10;

  const total = m.protein_g + m.carbs_g + m.fat_g;
  const p = total ? m.protein_g / total : 0;
  const f = total ? m.fat_g / total : 0;

  if (p < 0.2 || p > 0.4) score -= 5;
  if (f > 0.4) score -= 15;

  return Math.max(0, Math.min(100, score));
};

const labelColor = (s: number) =>
  s >= 70 ? "text-emerald-400" : s >= 45 ? "text-yellow-400" : "text-red-400";

const NutritionAnalysis = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null); // annotated image returned by backend
  const [portion, setPortion] = useState("1.0");
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [textDescription, setTextDescription] = useState(""); // NEW: description
  const [selectedModel, setSelectedModel] = useState("indian"); // NEW: model selector
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
    // keep finalImage (annotated) if any, but clear it so user can re-analyze
    setFinalImage(null);
  };

  const toggleCondition = (value: string) => {
    setConditions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const analyze = async () => {
    // allow analyze with either image OR description
    if (!imageFile && !textDescription.trim()) {
      return alert("Please upload an image or describe the food before analyzing.");
    }

    setLoading(true);

    const applied = [...conditions];
    if (customCondition.trim()) applied.push(customCondition.trim());

    const fd = new FormData();
    if (imageFile) fd.append("file", imageFile);
    fd.append("portion", portion);
    fd.append("conditions", applied.join(","));
    fd.append("description", textDescription.trim()); // send description (may be empty)
    fd.append("model_type", selectedModel); // send model preference

    try {
      const res = await fetch(API_URL, { method: "POST", body: fd });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend Error:", errText);
        alert("Server error. Check console.");
        setLoading(false);
        return;
      }

      let json: NutritionResponse;
      try {
        json = await res.json();
      } catch (err) {
        console.error("JSON Parse Error:", err);
        alert("Invalid response from server.");
        setLoading(false);
        return;
      }

      setNutritionData(json || {});

      // backend may return annotated image under image_with_boxes or annotated_image
      const annotated = json.image_with_boxes ?? json.annotated_image ?? null;
      setFinalImage(annotated);
    } catch (err) {
      console.error(err);
      alert("Network error. Check console.");
    }

    setLoading(false);
  };

  const data = nutritionData ?? {};
  const score = computeHealthyScore(data);

  // Updated suggestions logic (still frontend-level; backend should produce clinically-backed tips)
  const smartSuggestions: string[] = [];
  const macros = data.macros ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
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
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-2 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
            </div>
            <div className="flex items-center gap-2 text-emerald-300">Analyzing your meal…</div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-10 py-24 grid lg:grid-cols-2 gap-16">
        {/* LEFT */}
        <div className="space-y-8">
          <h1 className="font-serif italic text-6xl tracking-tight">Nutrition Scan</h1>
          <p className="text-gray-400 text-sm">Smart insights. Better choices.</p>

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

          {/* Model selector (NEW) */}
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Model Type</p>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full"
            >
              <option value="indian">Indian YOLO Model</option>
              <option value="western">Western YOLO Model</option>
            </select>
          </div>

          {/* Food Description (Optional) */}
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Describe Food (optional)</p>
            <textarea
              className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full h-24"
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
                  className={`px-4 py-1.5 rounded-xl text-xs ${
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
            className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 w-full"
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
          />

          <Button
            onClick={analyze}
            className="bg-gradient-to-r from-emerald-500 to-green-300 text-black font-bold w-full py-3 rounded-2xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Meal"}
          </Button>
        </div>

        {/* RIGHT */}
        <div className="space-y-10">
          {/* Upload Card */}
          <Card className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-3xl h-80 flex items-center justify-center">
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} className="w-full h-full rounded-2xl object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={removeImage}
                    className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer">
                <Upload className="w-10 h-10 text-emerald-400" />
                Upload Food Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </Card>

          {/* If backend returned annotated image, show it */}
          {finalImage && (
            <Card className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-3xl">
              <p className="text-xs text-gray-400 uppercase mb-2">Detected & Labeled</p>
              <img src={finalImage} className="w-full rounded-2xl object-contain" />
            </Card>
          )}

          {/* Detected */}
          {data.detected_food?.length ? (
            <Card className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl space-y-2">
              <p className="text-xs text-gray-400 uppercase">Detected Food</p>
              <div className="flex gap-2 flex-wrap">
                {data.detected_food.map((f, i) => (
                  <span key={i} className="px-3 py-1 text-xs bg-emerald-500/20 rounded-xl text-emerald-300">
                    {f}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Results */}
          {nutritionData && (
            <div className="space-y-8">
              <Card className="bg-neutral-900/70 border border-neutral-800 p-8 rounded-3xl">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Healthy Score</p>
                    <p className={`text-6xl font-serif italic font-bold ${labelColor(score)}`}>{score}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Energy</p>
                    <p className="text-4xl font-bold">{data.estimated_calories ?? 0} kcal</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {Object.entries(macros).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-sm capitalize">
                        <span>{k.replace("_g", "")}</span>
                        <span>{v}g</span>
                      </div>
                      <Progress value={v} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-3xl space-y-3">
                <p className="text-xs text-gray-500 uppercase">Micronutrients (est.)</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-800 p-3 rounded">Iron — 2 mg</div>
                  <div className="bg-neutral-800 p-3 rounded">Calcium — 120 mg</div>
                  <div className="bg-neutral-800 p-3 rounded">Magnesium — 40 mg</div>
                  <div className="bg-neutral-800 p-3 rounded">Potassium — 220 mg</div>
                </div>
              </Card>

              <Card className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-3xl space-y-6">
                {!!data.diet_recommendations?.add?.length && (
                  <div>
                    <p className="text-sm text-emerald-400 font-semibold">Add</p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {data.diet_recommendations.add.map((x, i) => (
                        <span key={i} className="px-3 py-1 text-xs bg-emerald-500/20 rounded-xl text-emerald-300">
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!data.diet_recommendations?.reduce?.length && (
                  <div>
                    <p className="text-sm text-red-400 font-semibold">Reduce</p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {data.diet_recommendations.reduce.map((x, i) => (
                        <span key={i} className="px-3 py-1 text-xs bg-red-500/20 rounded-xl text-red-300">
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.diet_recommendations?.overall_comment && (
                  <p className="text-xs text-gray-300 italic text-center">{data.diet_recommendations.overall_comment}</p>
                )}
              </Card>

              <Card className="bg-neutral-900/70 border border-emerald-400/30 p-6 rounded-3xl space-y-3">
                <p className="text-sm text-emerald-400 font-semibold">Smart Meal Enhancements</p>
                <ul className="space-y-1 text-xs text-gray-300">
                  {smartSuggestions.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400">✔</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalysis;
