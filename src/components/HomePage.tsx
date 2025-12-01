import { Camera, Package, BarChart3, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-food.jpg";

const HomePage = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const features = [
    {
      id: "nutrition",
      icon: BarChart3,
      title: "Nutrition Scan",
      description: "Snap a photo — instantly know calories & health score",
    },
    {
      id: "scan",
      icon: Camera,
      title: "Freshness Check",
      description: "Detect if your food is safe, stale or spoiled",
    },
    {
      id: "inventory",
      icon: Package,
      title: "Smart Inventory",
      description: "Track what you have & get expiry reminders",
    },
    {
      id: "recipes",
      icon: ChefHat,
      title: "AI Meal Genius",
      description: "Get recipes from what’s in your kitchen",
    },
  ];

  return (
    <div className="relative bg-black text-gray-100 overflow-hidden font-sans">
      
      {/* Subtle gradient glow behind UI */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_70%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32 grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left Column */}
        <div className="space-y-10 animate-fade-in">
          <h1 className="font-serif text-6xl md:text-7xl tracking-tight leading-[1.05]">
            A Smarter Way to
            <span className="block bg-gradient-to-r from-emerald-400 to-green-200 text-transparent bg-clip-text italic">
              Eat & Live Better
            </span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed max-w-lg font-light">
            FoodBoss helps you make mindful food decisions — improve your nutrition,
            reduce waste, and build healthier habits with AI by your side.
          </p>

          <div className="flex flex-wrap gap-5">
            <Button
              className="bg-gradient-to-r from-emerald-500 to-green-300 text-black font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
              onClick={() => setActiveTab("nutrition")}
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>

            <Button
              variant="outline"
              className="border border-emerald-400 text-emerald-300 hover:bg-emerald-500 hover:text-black px-7 py-4 rounded-2xl backdrop-blur-sm font-semibold transition"
              onClick={() => setActiveTab("inventory")}
            >
              Explore Kitchen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-gray-500 italic">
            Empowering better decisions. One plate at a time.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative flex justify-center items-start overflow-visible">
          <img
            src={heroImage}
            alt="Healthy Bowl"
            className="h-[100vh] w-auto object-cover rounded-2xl translate-x-24 -translate-y-32"
          />
        </div>


      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-6 pb-32">
        <h2 className="text-center font-serif text-5xl tracking-tight mb-20 leading-[1.1]">
          Powered by <span className="text-emerald-400 italic">Intelligent Food Insights</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-xl
                hover:border-emerald-500 hover:-translate-y-2 transition duration-300"
                style={{ animationDelay: `${i * 120}ms`, animation: "fade-in .6s forwards" }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl font-medium">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-5">
                  <Button
                    className="w-full bg-neutral-800 hover:bg-emerald-500 hover:text-black font-medium rounded-xl py-2"
                    onClick={() => setActiveTab(feature.id)}
                  >
                    Try Now
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
