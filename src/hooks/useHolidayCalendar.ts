import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Holiday {
  id: string;
  date: string;
  name: string;
  market: string;
  type: string;
}

export const useHolidayCalendar = () => {
  return useQuery({
    queryKey: ['holiday-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-holiday-calendar');
      
      if (error) throw error;
      return data as { success: boolean; holidays: Holiday[] };
    },
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours
  });
};
