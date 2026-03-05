import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalysisItem {
  id: string;
  title: string;
  time: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  tags: string[];
  category: string;
  priority: number;
  source?: string;
  url?: string;
}

export const useMarketAnalysis = () => {
  return useQuery({
    queryKey: ['market-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-market-analysis');
      
      if (error) throw error;
      return data as { success: boolean; analyses: AnalysisItem[]; lastUpdated: string };
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
