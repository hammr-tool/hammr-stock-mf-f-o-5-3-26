import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketMovers, MarketMover } from "@/hooks/useMarketMovers";
import { StockLogo } from "./StockLogo";
import { cn } from "@/lib/utils";

type MarketCapFilter = "all" | "Large Cap" | "Mid Cap" | "Small Cap";

export const MarketMoversSection = () => {
  const [moverType, setMoverType] = useState<"gainers" | "losers">("gainers");
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapFilter>("all");
  const navigate = useNavigate();

  const { data: movers, isLoading } = useMarketMovers(
    moverType,
    marketCapFilter === "all" ? undefined : marketCapFilter
  );

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const MoverCard = ({ stock }: { stock: MarketMover }) => (
    <button
      onClick={() => navigate(`/stocks/${stock.symbol}`)}
      className="w-full p-2 rounded-lg border bg-card hover:bg-accent/30 transition-colors text-left"
    >
      <div className="flex items-center gap-2">
        <StockLogo symbol={stock.symbol} companyName={stock.company_name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[11px] sm:text-[13px] truncate">{stock.symbol}</div>
          <p className="text-[9px] sm:text-[11px] text-muted-foreground truncate">
            {stock.company_name}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="font-medium text-[11px] sm:text-xs">{formatPrice(stock.current_price)}</div>
        <div
          className={cn(
            "text-[11px] sm:text-xs font-medium flex items-center gap-0.5",
            stock.change_percent >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {stock.change_percent >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {formatChange(stock.change_percent)}
        </div>
      </div>
    </button>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 rounded-lg border">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Today's Market Movers</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Tabs value={moverType} onValueChange={(v) => setMoverType(v as typeof moverType)}>
            <TabsList className="h-8">
              <TabsTrigger value="gainers" className="text-xs h-7 px-3 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Gainers
              </TabsTrigger>
              <TabsTrigger value="losers" className="text-xs h-7 px-3 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Losers
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-1">
            {(["all", "Large Cap", "Mid Cap", "Small Cap"] as const).map((cap) => (
              <Button
                key={cap}
                variant={marketCapFilter === cap ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setMarketCapFilter(cap)}
              >
                {cap === "all" ? "All" : cap.replace(" Cap", "")}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : movers && movers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {movers.map((stock) => (
              <MoverCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No {moverType} found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
