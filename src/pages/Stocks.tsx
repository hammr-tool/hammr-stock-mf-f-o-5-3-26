import { useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockSearchBar } from "@/components/stocks/StockSearchBar";
import { StockScreener } from "@/components/stocks/StockScreener";
import { MarketMoversSection } from "@/components/stocks/MarketMoversSection";
import { supabase } from "@/integrations/supabase/client";
import { Database, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Stocks = () => {
  const { toast } = useToast();

  // Check if we have stock data
  const { data: stockCount, refetch } = useQuery({
    queryKey: ["stock-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("stocks")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
  });

  // Seed data if empty
  const handleSeedData = async () => {
    toast({
      title: "Seeding stock data...",
      description: "This may take a minute. Please wait.",
    });

    try {
      const { data, error } = await supabase.functions.invoke("seed-stock-data", {});
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `${data.successCount} stocks have been added to the database.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Seed error:", error);
      toast({
        title: "Error",
        description: "Failed to seed stock data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        {/* Search */}
        <div className="mb-4">
          <StockSearchBar autoFocus className="max-w-2xl" />
        </div>

        {/* Show seed button if no data */}
        {stockCount === 0 && (
          <Card className="mb-6 border-dashed">
            <CardContent className="py-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Stock Data</h3>
              <p className="text-muted-foreground mb-4">
                The database is empty. Click below to populate it with Nifty 500 stocks.
              </p>
              <Button onClick={handleSeedData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Stock Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Market Movers first, then Screener */}
        <div className="space-y-3 sm:space-y-6">
          <MarketMoversSection />
          <StockScreener />
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
};

export default Stocks;
