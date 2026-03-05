import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const useMarketIndices = () => {
  return useQuery({
    queryKey: ['market-indices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-market-indices');
      
      if (error) throw error;
      return data.indices as MarketIndex[];
    },
    refetchInterval: 1000, // Refetch every 1 second
    staleTime: 500,
  });
};
