import { Camera, Home, Package, Utensils, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scan', icon: Camera, label: 'Scan Food' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'nutrition', icon: BarChart3, label: 'Nutrition' },
    { id: 'recipes', icon: Utensils, label: 'Recipes' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-fresh rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">SmartFood Assistant</h1>
        </div>
        
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "fresh" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="flex items-center space-x-2"
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