import { LayoutDashboard, ScanBarcode, ChefHat, Mic } from "lucide-react";
import { Section } from "@/pages/Index";

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const navItems = [
  { id: "dashboard" as Section, label: "Dashboard", icon: LayoutDashboard },
  { id: "scanner" as Section, label: "Scan & Verdict", icon: ScanBarcode },
  { id: "recipes" as Section, label: "Recipes & List", icon: ChefHat },
  { id: "voice" as Section, label: "Nani Voice Bot", icon: Mic },
];

export const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-sidebar-border p-6 flex flex-col">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-primary mb-1">NutriNani</h1>
        <p className="text-sm text-muted-foreground">Decoding labels for a healthier you</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          Demo version for hackathon
        </p>
      </div>
    </aside>
  );
};
