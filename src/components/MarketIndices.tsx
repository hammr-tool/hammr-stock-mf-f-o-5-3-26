import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, Loader2 } from "lucide-react";
import { useMarketIndices } from "@/hooks/useMarketIndices";

export const MarketIndices = () => {
  const { data: indices, isLoading, error } = useMarketIndices();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error || !indices) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          Unable to load market data
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Market Indices (Live)</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.map((index) => (
          <div key={index.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-muted-foreground mb-1">{index.name}</div>
            <div className="text-2xl font-bold mb-2">{index.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center gap-1 text-sm font-medium ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {index.change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(index.change).toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
