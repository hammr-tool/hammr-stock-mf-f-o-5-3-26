import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EconomicEvent {
  id: string;
  date: string;
  country: string;
  flag: string;
  event: string;
  impact: string;
  expected: string;
  actual: string;
  previous: string;
}

export const useEconomicCalendar = () => {
  return useQuery({
    queryKey: ['economic-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-economic-calendar');
      
      if (error) throw error;
      return data as { success: boolean; events: EconomicEvent[] };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
