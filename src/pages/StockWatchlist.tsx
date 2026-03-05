import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockLogo } from "@/components/stocks/StockLogo";
import { cn } from "@/lib/utils";
import { Star, Trash2 } from "lucide-react";

const StockWatchlist = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["watchlist-stocks", watchlist],
    queryFn: async () => {
      if (watchlist.length === 0) return [];
      const { data, error } = await supabase
        .from("stocks")
        .select("symbol, company_name, sector, market_cap_category, current_price, change_percent, market_cap")
        .in("symbol", watchlist);
      if (error) throw error;
      return data || [];
    },
    enabled: watchlist.length > 0,
  });

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-lg font-bold">My Watchlist</h2>
          <Badge variant="secondary">{watchlist.length}</Badge>
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No stocks in watchlist</h3>
              <p className="text-muted-foreground mb-4">
                Open any stock and tap the star icon to add it here.
              </p>
              <Button onClick={() => navigate("/stocks")}>Browse Stocks</Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {stocks?.map((stock) => (
              <Card
                key={stock.symbol}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
              >
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={stock.symbol} companyName={stock.company_name} size="sm" />
                    <div>
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {stock.company_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {stock.current_price ? formatPrice(stock.current_price) : "—"}
                      </div>
                      <div className={cn(
                        "text-xs font-medium",
                        (stock.change_percent || 0) >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {stock.change_percent !== null
                          ? `${stock.change_percent >= 0 ? "+" : ""}${stock.change_percent.toFixed(2)}%`
                          : "—"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.symbol);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default StockWatchlist;
