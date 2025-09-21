import { Camera, Home, Package, Utensils, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "scan", icon: Camera, label: "Scan Food" },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "nutrition", icon: BarChart3, label: "Nutrition" },
    { id: "recipes", icon: Utensils, label: "Recipes" },
  ];

  return (
    <nav className="bg-black border-b border-neutral-800 px-6 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-emerald-400">
            SmartFood Assistant
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-black"
                    : "text-gray-400 hover:bg-neutral-800 hover:text-emerald-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
