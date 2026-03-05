import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Building2, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useStockDetails } from "@/hooks/useStockDetails";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";
import { StockFundamentals } from "./StockFundamentals";
import { StockFinancials } from "./StockFinancials";
import { StockShareholding } from "./StockShareholding";
import { StockPeers } from "./StockPeers";

export const StockDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useStockDetails(symbol || "");
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isWatchlisted = symbol ? isInWatchlist(symbol) : false;

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 100000) return `₹${(cap / 100000).toFixed(2)} Lakh Cr`;
    if (cap >= 1000) return `₹${(cap / 1000).toFixed(2)}K Cr`;
    return `₹${cap.toFixed(0)} Cr`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  if (error || !data?.stock) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/stocks")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stocks
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Stock not found or data unavailable
              </p>
              <Button className="mt-4" onClick={() => navigate("/stocks")}>
                Search for another stock
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const stock = data.stock;
  const isPositive = (stock.change_percent || 0) >= 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/stocks")} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stocks
          </Button>
          <Button
            variant={isWatchlisted ? "default" : "outline"}
            size="sm"
            onClick={() => symbol && toggleWatchlist(symbol)}
            className={cn(
              "gap-1.5",
              isWatchlisted && "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
            )}
          >
            <Star className={cn("h-4 w-4", isWatchlisted && "fill-current")} />
            {isWatchlisted ? "Watchlisted" : "Watchlist"}
          </Button>
        </div>

        {/* Stock Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold">{stock.symbol}</h1>
                  <Badge variant="outline">{stock.exchange}</Badge>
                  {stock.market_cap_category && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {stock.market_cap_category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{stock.company_name}</p>
                {stock.sector && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{stock.sector}</span>
                    {stock.industry && stock.industry !== stock.sector && (
                      <>
                        <span>•</span>
                        <span>{stock.industry}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {stock.current_price ? formatPrice(stock.current_price) : "—"}
                </div>
                {stock.change_percent !== undefined && (
                  <div
                    className={cn(
                      "flex items-center justify-end gap-2 text-base font-semibold",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {formatChange(stock.change_percent)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="font-semibold text-sm">
                  {stock.market_cap ? formatMarketCap(stock.market_cap) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
                <p className="font-semibold text-sm">{stock.pe_ratio?.toFixed(2) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W High</p>
                <p className="font-semibold text-sm">
                  {stock.week_52_high ? formatPrice(stock.week_52_high) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">52W Low</p>
                <p className="font-semibold text-sm">
                  {stock.week_52_low ? formatPrice(stock.week_52_low) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="fundamentals" className="space-y-4">
          <div className="overflow-x-auto scrollbar-hide -mx-1">
            <TabsList className="inline-flex w-max min-w-full h-10 gap-1 bg-muted/50 p-1">
              <TabsTrigger value="fundamentals" className="text-[11px] sm:text-xs whitespace-nowrap">
                Fundamentals
              </TabsTrigger>
              <TabsTrigger value="financials" className="text-[11px] sm:text-xs whitespace-nowrap">
                Financials
              </TabsTrigger>
              <TabsTrigger value="shareholding" className="text-[11px] sm:text-xs whitespace-nowrap">
                Shareholding
              </TabsTrigger>
              <TabsTrigger value="peers" className="text-[11px] sm:text-xs whitespace-nowrap">
                Peers
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fundamentals">
            <StockFundamentals stock={stock} />
          </TabsContent>

          <TabsContent value="financials">
            <StockFinancials financials={data.financials} />
          </TabsContent>

          <TabsContent value="shareholding">
            <StockShareholding shareholding={data.shareholding} />
          </TabsContent>

          <TabsContent value="peers">
            <StockPeers sector={stock.sector} currentSymbol={stock.symbol} />
          </TabsContent>
        </Tabs>
      </main>
      <BottomTabBar />
    </div>
  );
};
