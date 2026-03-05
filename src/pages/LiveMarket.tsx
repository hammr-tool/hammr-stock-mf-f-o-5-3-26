import { useState } from "react";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { IndexPriceChart } from "@/components/IndexPriceChart";
import { LiveOptionChart } from "@/components/LiveOptionChart";
import { IVChart } from "@/components/IVChart";
import { INDICES } from "@/config/indices";
import { useLiveChartData } from "@/hooks/useLiveChartData";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
 import { BottomTabBar } from "@/components/BottomTabBar";

const LiveMarket = () => {
  const [selectedIndex, setSelectedIndex] = useState(INDICES[0]);
  const { data, isLoading, error } = useLiveChartData(selectedIndex.symbol, selectedIndex.strikeInterval);

  const handleIndexChange = (symbol: string) => {
    const index = INDICES.find(i => i.symbol === symbol);
    if (index) setSelectedIndex(index);
  };

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
          isMarketOpen={data?.isMarketOpen}
        />

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
              Unable to load live market data. Please try again later.
            </div>
          </Card>
        )}

        {data && (
          <div className="space-y-4">
            <IndexPriceChart 
              data={data.intradayPriceData} 
              indexName={selectedIndex.name}
            />
            
            <div className="grid lg:grid-cols-2 gap-4">
              <LiveOptionChart 
                data={data.optionPremiumData}
                atmStrike={data.atmStrike}
                indexName={selectedIndex.name}
              />
              
              <IVChart 
                data={data.ivSmileData}
                atmStrike={data.atmStrike}
                currentPrice={data.currentPrice}
              />
            </div>
          </div>
        )}
      </main>
       <BottomTabBar />
    </div>
  );
};

export default LiveMarket;
