import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockSearchResult {
  id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  current_price: number | null;
  change_percent: number | null;
  market_cap_category: string | null;
}

export const useStockSearch = (query: string) => {
  return useQuery({
    queryKey: ["stock-search", query],
    queryFn: async (): Promise<StockSearchResult[]> => {
      if (!query || query.length < 1) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke("fetch-stock-search", {
        body: { query },
      });

      if (error) {
        console.error("Stock search error:", error);
        throw error;
      }

      return data?.results || [];
    },
    enabled: query.length >= 1,
    staleTime: 30000,
  });
};
