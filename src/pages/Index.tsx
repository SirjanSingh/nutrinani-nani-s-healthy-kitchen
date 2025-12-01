import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Scanner } from "@/components/Scanner";
import { Recipes } from "@/components/Recipes";
import { VoiceBot } from "@/components/VoiceBot";

export type Section = "dashboard" | "scanner" | "recipes" | "voice";

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8 lg:p-12 max-w-7xl animate-fade-in">
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "scanner" && <Scanner />}
          {activeSection === "recipes" && <Recipes />}
          {activeSection === "voice" && <VoiceBot />}
        </div>
      </main>
    </div>
  );
};

export default Index;
