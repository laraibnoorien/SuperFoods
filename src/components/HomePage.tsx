import { Camera, Package, BarChart3, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-food.jpg";

const HomePage = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const features = [
    {
      id: "scan",
      icon: Camera,
      title: "Food Freshness Scanner",
      description: "Detect if your food is fresh, semi-fresh, or spoiled",
      color: "emerald",
    },
    {
      id: "inventory",
      icon: Package,
      title: "Smart Inventory Tracking",
      description: "Track expiry dates and get notifications",
      color: "emerald",
    },
    {
      id: "nutrition",
      icon: BarChart3,
      title: "Nutrition Analysis",
      description: "Analyze dishes for calories, macros & micros",
      color: "emerald",
    },
    {
      id: "recipes",
      icon: ChefHat,
      title: "AI Recipe Generator",
      description: "Personalized recipes from your inventory",
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-16 bg-black text-gray-200 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Smart Food{" "}
              <span className="block text-emerald-400">Assistant</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
              Reduce waste, track freshness, analyze nutrition & generate
              recipes with AI-powered food management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg"
                onClick={() => setActiveTab("scan")}
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>
              <Button
                variant="outline"
                className="border border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold px-6 py-3 rounded-lg"
                onClick={() => setActiveTab("inventory")}
              >
                View Inventory
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          <div>
            <img
              src={heroImage}
              alt="Fresh fruits and vegetables"
              className="rounded-xl shadow-lg w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
          <span className="block text-emerald-400">For Smart Food Management</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:shadow-lg hover:border-emerald-500 transition"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 rounded-lg"
                    onClick={() => setActiveTab(feature.id)}
                  >
                    Try Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
