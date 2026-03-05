import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketMover {
  symbol: string;
  company_name: string;
  sector?: string;
  market_cap_category?: string;
  current_price: number;
  previous_close?: number;
  change_percent: number;
  volume?: number;
}

export const useMarketMovers = (
  type: "gainers" | "losers" = "gainers",
  marketCap?: string
) => {
  return useQuery({
    queryKey: ["market-movers", type, marketCap],
    queryFn: async (): Promise<MarketMover[]> => {
      const { data, error } = await supabase.functions.invoke("fetch-market-movers", {
        body: { type, marketCap },
      });

      if (error) {
        console.error("Market movers error:", error);
        throw error;
      }

      return data?.movers || [];
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
};
