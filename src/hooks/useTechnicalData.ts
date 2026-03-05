import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TechnicalIndicator {
  category: string;
  name: string;
  value: string;
  signal: string;
  strength: number;
}

export interface TechnicalRecommendation {
  action: string;
  confidence: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

export interface TechnicalData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  atmStrike: number;
  indicators: TechnicalIndicator[];
  recommendation: TechnicalRecommendation;
  timestamp: string;
}

export const useTechnicalData = (symbol: string, strikeInterval: number) => {
  return useQuery({
    queryKey: ['technical-data', symbol, strikeInterval],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-technical-data', {
        body: { symbol, strikeInterval }
      });
      
      if (error) throw error;
      return data as TechnicalData;
    },
    refetchInterval: 1000, // Refetch every 1 second
    staleTime: 500,
    enabled: !!symbol,
  });
};
