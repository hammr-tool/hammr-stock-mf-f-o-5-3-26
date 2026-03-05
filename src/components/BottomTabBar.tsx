 import { TrendingUp, BarChart3, PiggyBank } from "lucide-react";
 import { useTab } from "@/contexts/TabContext";
 import { cn } from "@/lib/utils";
 import { useNavigate } from "react-router-dom";
 
const tabs = [
  { id: "stocks" as const, label: "Stocks", icon: TrendingUp },
  { id: "mutual-funds" as const, label: "Mutual Funds", icon: PiggyBank },
  { id: "fo" as const, label: "F&O", icon: BarChart3 },
];
 
 export const BottomTabBar = () => {
   const { activeTab, setActiveTab } = useTab();
   const navigate = useNavigate();
 
   const handleTabClick = (tabId: typeof tabs[number]["id"]) => {
     setActiveTab(tabId);
     // Navigate to the home route of each tab
      if (tabId === "stocks") {
        navigate("/stocks");
      } else if (tabId === "fo") {
        navigate("/fo");
      } else if (tabId === "mutual-funds") {
        navigate("/");
      }
   };
 
   return (
     <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
       <div className="flex items-center justify-around h-16">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => handleTabClick(tab.id)}
               className={cn(
                 "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                 isActive
                   ? "text-primary"
                   : "text-muted-foreground hover:text-foreground"
               )}
             >
               <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
               <span className={cn("text-xs font-medium", isActive && "text-primary")}>
                 {tab.label}
               </span>
             </button>
           );
         })}
       </div>
     </div>
   );
 };