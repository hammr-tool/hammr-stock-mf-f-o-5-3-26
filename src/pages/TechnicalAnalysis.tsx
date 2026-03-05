import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { IndicatorCard } from "@/components/IndicatorCard";
import { OverallSuggestion } from "@/components/OverallSuggestion";
import { INDICES } from "@/config/indices";
import { useTechnicalData } from "@/hooks/useTechnicalData";
import { Loader2, Lightbulb, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 import { BottomTabBar } from "@/components/BottomTabBar";

const TechnicalAnalysis = () => {
  const [selectedIndex, setSelectedIndex] = useState(INDICES[0]);
  const { data, isLoading, error } = useTechnicalData(selectedIndex.symbol, selectedIndex.strikeInterval);

  const handleIndexChange = (symbol: string) => {
    const index = INDICES.find(i => i.symbol === symbol);
    if (index) setSelectedIndex(index);
  };

  // Group indicators by category
  const groupedIndicators = data?.indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, typeof data.indicators>);

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-4 space-y-4">
        <PageHeader
          selectedIndex={selectedIndex}
          onIndexChange={handleIndexChange}
          currentPrice={data?.currentPrice}
          change={data?.change}
          changePercent={data?.changePercent}
          atmStrike={data?.atmStrike}
          timestamp={data?.timestamp}
          isLoading={isLoading}
        />

        {/* Option Strategies Button */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <Link to="/option-strategies" className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto md:px-12 h-10 text-sm font-semibold border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 hover:from-emerald-100 hover:via-green-100 hover:to-emerald-100 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-emerald-950/30 dark:hover:from-emerald-950/50 dark:hover:via-green-950/50 dark:hover:to-emerald-950/50 text-emerald-700 dark:text-emerald-300 gap-2 uppercase tracking-wide"
            >
              <span>OPTION</span>
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>STRATEGIES</span>
            </Button>
          </Link>
          <Link to="/option-strategies#calculator" className="w-full md:hidden">
            <Button
              variant="outline"
              className="w-full h-10 text-sm font-semibold border-2 border-blue-400 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 hover:from-blue-100 hover:via-sky-100 hover:to-blue-100 dark:from-blue-950/30 dark:via-sky-950/30 dark:to-blue-950/30 dark:hover:from-blue-950/50 dark:hover:via-sky-950/50 dark:hover:to-blue-950/50 text-blue-700 dark:text-blue-300 gap-2 uppercase tracking-wide"
            >
              <LineChart className="h-5 w-5" />
              <span>STRATEGY CALCULATOR</span>
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card className="p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              Unable to load technical data. Please try again later.
            </div>
          </Card>
        )}

        {data && groupedIndicators && (
          <div className="space-y-4">
            {Object.entries(groupedIndicators).map(([category, indicators]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-base font-semibold">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                  {indicators.map((indicator) => (
                    <IndicatorCard
                      key={indicator.name}
                      name={indicator.name}
                      value={indicator.value}
                      signal={indicator.signal}
                      strength={indicator.strength}
                    />
                  ))}
                </div>
              </div>
            ))}

            <OverallSuggestion
              recommendation={data.recommendation.action}
              confidence={data.recommendation.confidence}
              bullishCount={data.recommendation.bullishCount}
              bearishCount={data.recommendation.bearishCount}
              neutralCount={data.recommendation.neutralCount}
            />
          </div>
        )}
      </main>
       <BottomTabBar />
    </div>
  );
};

export default TechnicalAnalysis;
