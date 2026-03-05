import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TabProvider } from "@/contexts/TabContext";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import LiveMarket from "./pages/LiveMarket";
import OIData from "./pages/OIData";
import EconomicCalendar from "./pages/EconomicCalendar";
import HolidayCalendar from "./pages/HolidayCalendar";
import MarketAnalysis from "./pages/MarketAnalysis";
import GlobalMarket from "./pages/GlobalMarket";
import OptionStrategies from "./pages/OptionStrategies";
import Stocks from "./pages/Stocks";
import StockWatchlist from "./pages/StockWatchlist";
import MutualFunds from "./pages/MutualFunds";
import NotFound from "./pages/NotFound";
import DisclaimerModal from "./components/DisclaimerModal";
import { StockDetailPage } from "./components/stocks/StockDetailPage";
import { FundDetailPage } from "./components/mutualfunds/FundDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DisclaimerModal />
      <BrowserRouter>
        <TabProvider>
          <Routes>
            {/* Default route - Mutual Funds */}
            <Route path="/" element={<MutualFunds />} />
            
            {/* F&O Routes */}
            <Route path="/fo" element={<TechnicalAnalysis />} />
            <Route path="/live-market" element={<LiveMarket />} />
            <Route path="/oi-data" element={<OIData />} />
            <Route path="/economic-calendar" element={<EconomicCalendar />} />
            <Route path="/holiday-calendar" element={<HolidayCalendar />} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />
            <Route path="/option-strategies" element={<OptionStrategies />} />
            
            {/* Global Market (shared across all tabs) */}
            <Route path="/global-market" element={<GlobalMarket />} />
            
            {/* Stocks Routes */}
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/watchlist" element={<StockWatchlist />} />
            <Route path="/stocks/:symbol" element={<StockDetailPage />} />
            
            {/* Mutual Funds Routes */}
            <Route path="/mutual-funds" element={<MutualFunds />} />
            <Route path="/mutual-funds/fund/:schemeCode" element={<FundDetailPage />} />
            <Route path="/mutual-funds/*" element={<MutualFunds />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TabProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
