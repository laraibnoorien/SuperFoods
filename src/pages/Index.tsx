import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import FreshnessScan from "@/components/FreshnessScan";
import InventoryDashboard from "@/components/InventoryDashboard";
import NutritionAnalysis from "@/components/NutritionAnalysis";
import RecipeGenerator from "@/components/RecipeGenerator";

const queryClient = new QueryClient();

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage setActiveTab={setActiveTab} />;
      case "scan":
        return <FreshnessScan />;
      case "inventory":
        return <InventoryDashboard />;
      case "nutrition":
        return <NutritionAnalysis />;
      case "recipes":
        return <RecipeGenerator />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen w-screen bg-gradient-to-b from-emerald-600 via-emerald-700 to-green-800 overflow-hidden">
          
          {/* Navigation Bar */}
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Full-screen content area */}
          <main className="w-full min-h-screen pt--1">
            {renderContent()}
          </main>
        </div>

        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;
