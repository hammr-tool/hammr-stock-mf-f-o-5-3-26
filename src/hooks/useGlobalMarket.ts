import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GlobalIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated?: string;
}

export const useGlobalMarket = () => {
  return useQuery({
    queryKey: ['global-market'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-global-market');
      
      if (error) throw error;
      return data.indices as GlobalIndex[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
  });
};
