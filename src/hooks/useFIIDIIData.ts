import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FIIDIIDataPoint {
  date: string;
  index?: number;
  equity?: number;
  debt: number;
  hybrid: number;
}

export const useFIIDIIData = () => {
  return useQuery({
    queryKey: ['fii-dii-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-fii-dii-data');

      if (error) throw error;
      return {
        fiiData: data.fiiData as FIIDIIDataPoint[],
        diiData: data.diiData as FIIDIIDataPoint[],
      };
    },
    // Ensure users don't keep seeing old cached trading-day data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 0,
  });
};
