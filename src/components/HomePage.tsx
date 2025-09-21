import { Camera, Package, BarChart3, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-food.jpg";

const HomePage = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const features = [
    {
      id: 'scan',
      icon: Camera,
      title: 'Food Freshness Scanner',
      description: 'Use AI to detect if your food is fresh, semi-fresh, or spoiled',
      color: 'fresh'
    },
    {
      id: 'inventory',
      icon: Package,
      title: 'Smart Inventory Tracking',
      description: 'Track your food items, expiry dates, and get notifications',
      color: 'default'
    },
    {
      id: 'nutrition',
      icon: BarChart3,
      title: 'Nutrition Analysis',
      description: 'Analyze dishes for calories, macros, and micronutrients',
      color: 'nutrition'
    },
    {
      id: 'recipes',
      icon: ChefHat,
      title: 'AI Recipe Generator',
      description: 'Generate personalized recipes based on your inventory',
      color: 'cooking'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero rounded-2xl">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Smart Food
                <span className="block text-primary">Assistant</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Reduce food waste, track freshness, analyze nutrition, and generate recipes with AI-powered food management
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="fresh" size="lg" onClick={() => setActiveTab('scan')}>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </Button>
                <Button variant="outline" size="lg" onClick={() => setActiveTab('inventory')}>
                  View Inventory
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Fresh fruits and vegetables"
                className="rounded-xl shadow-elegant w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Smart Food Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From freshness detection to recipe generation, our AI-powered tools help you make the most of your food
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-fresh rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={feature.color as any} 
                    className="w-full"
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

      {/* Stats Section */}
      <section className="bg-muted/30 rounded-2xl py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Freshness Detection Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">30%</div>
              <div className="text-muted-foreground">Average Food Waste Reduction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">1000+</div>
              <div className="text-muted-foreground">Recipe Combinations</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;