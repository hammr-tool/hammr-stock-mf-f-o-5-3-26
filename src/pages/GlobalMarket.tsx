import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Clock, RefreshCw, Globe } from "lucide-react";
import { useGlobalMarket } from "@/hooks/useGlobalMarket";
import { cn } from "@/lib/utils";
 import { BottomTabBar } from "@/components/BottomTabBar";

const GlobalMarket = () => {
  const { data, isLoading, error, dataUpdatedAt } = useGlobalMarket();

  const formatValue = (value: number, decimals: number = 2) => {
    return value.toLocaleString('en-IN', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatTime = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    // Show relative time for recent updates
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    // For older updates, show date and time
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const getLastUpdatedText = () => {
    if (!dataUpdatedAt) return '';
    const date = new Date(dataUpdatedAt);
    return `Data fetched: ${date.toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })} IST`;
  };

  const categories: { title: string; indices: string[] }[] = [
    { title: "Indian Markets", indices: ["NIFTY 50", "SENSEX", "NIFTY BANK", "INDIA VIX"] },
    { title: "US Markets", indices: ["DOW JONES", "NASDAQ", "S&P 500", "RUSSELL 2000"] },
    { title: "Asian Markets", indices: ["NIKKEI 225"] },
    { title: "Commodities", indices: ["GOLD", "SILVER"] },
  ];

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span>{getLastUpdatedText()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Auto-refreshes every 5 seconds
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4 text-destructive">
              Error loading market data. Please try again.
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {categories.map((category) => (
              <div key={category.title}>
                <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.indices.map((indexName) => {
                      const indexData = data?.find(d => d.name === indexName);
                      
                      if (isLoading) {
                        return (
                          <Card key={indexName} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <Skeleton className="h-5 w-24" />
                            </CardHeader>
                            <CardContent>
                              <Skeleton className="h-8 w-32 mb-2" />
                              <Skeleton className="h-4 w-20" />
                            </CardContent>
                          </Card>
                        );
                      }

                      if (!indexData) return null;

                      const isPositive = (indexData?.changePercent || 0) >= 0;
                      const Icon = isPositive ? TrendingUp : TrendingDown;

                      return (
                        <Card 
                          key={indexName} 
                          className={cn(
                            "overflow-hidden transition-all hover:shadow-lg",
                            isPositive ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
                          )}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              {indexName}
                              <Icon className={cn("h-4 w-4", isPositive ? "text-green-500" : "text-red-500")} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {indexName === "GOLD" || indexName === "SILVER" ? "$" : ""}
                              {formatValue(indexData.value, indexName === "INDIA VIX" ? 2 : 2)}
                            </div>
                            <div className={cn(
                              "flex items-center gap-2 text-sm font-medium",
                              isPositive ? "text-green-500" : "text-red-500"
                            )}>
                              <span>
                                {isPositive ? "+" : ""}{formatValue(indexData.change, 2)}
                              </span>
                              <span>
                                ({isPositive ? "+" : ""}{formatValue(indexData.changePercent, 2)}%)
                              </span>
                            </div>
                            {indexData.lastUpdated && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3" />
                                <span>Market: {formatTime(indexData.lastUpdated)}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
              </div>
          ))}
        </div>
      </main>
       <BottomTabBar />
    </div>
  );
};

export default GlobalMarket;
