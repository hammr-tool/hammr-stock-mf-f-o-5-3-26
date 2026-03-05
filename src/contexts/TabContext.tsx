import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

type TabType = "stocks" | "fo" | "mutual-funds";

interface TabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

function getTabFromPath(pathname: string): TabType {
  if (pathname.startsWith("/stocks")) return "stocks";
  if (pathname.startsWith("/fo") || pathname === "/live-market" || pathname === "/oi-data" || pathname === "/market-analysis" || pathname === "/economic-calendar" || pathname === "/holiday-calendar" || pathname === "/option-strategies") return "fo";
  return "mutual-funds";
}

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};