import { useState } from "react";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { OptionChainWithGreeks } from "@/components/OptionChainWithGreeks";
import { LiveFIIDIIData } from "@/components/LiveFIIDIIData";
import { useMarketIndices } from "@/hooks/useMarketIndices";
import { INDICES } from "@/config/indices";
 import { BottomTabBar } from "@/components/BottomTabBar";

const OIData = () => {
  const [selectedIndex, setSelectedIndex] = useState(INDICES[0]);
  const { data: marketData } = useMarketIndices();

  const currentIndexData = marketData?.find(
    (idx) => idx.name === selectedIndex.name
  );

  const handleIndexChange = (symbol: string) => {
    const index = INDICES.find((idx) => idx.symbol === symbol);
    if (index) {
      setSelectedIndex(index);
    }
  };

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PageHeader
          selectedIndex={selectedIndex}
          onIndexChange={handleIndexChange}
          currentPrice={currentIndexData?.value}
          change={currentIndexData?.change}
          changePercent={currentIndexData?.changePercent}
        />
        
        <div className="space-y-6 mt-6">
          <OptionChainWithGreeks 
            symbol={selectedIndex.symbol}
            strikeInterval={selectedIndex.strikeInterval}
            indexName={selectedIndex.name}
          />
          <LiveFIIDIIData />
        </div>
      </main>
       <BottomTabBar />
    </div>
  );
};

export default OIData;
