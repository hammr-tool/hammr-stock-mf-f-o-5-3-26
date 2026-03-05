import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OptionData {
  strike: number;
  call: {
    oi: number;
    volume: number;
    iv: number;
    ltp: number;
    change: number;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
  };
  put: {
    oi: number;
    volume: number;
    iv: number;
    ltp: number;
    change: number;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
  };
}

const checkMarketOpen = (): boolean => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  
  // Market hours: 9:15 AM to 3:30 PM IST, Monday to Friday
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = currentMinutes >= marketOpen && currentMinutes <= marketClose;
  
  return isWeekday && isMarketHours;
};

export const useOptionData = (symbol: string = '^NSEI', strikeInterval: number = 50) => {
  const isMarketOpen = checkMarketOpen();
  
  return useQuery({
    queryKey: ['option-data', symbol, strikeInterval],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-option-data', {
        body: { symbol, strikeInterval }
      });
      
      if (error) throw error;
      return {
        optionData: data.optionData as OptionData[],
        currentPrice: data.currentPrice as number
      };
    },
    refetchInterval: isMarketOpen ? 30000 : false, // Refresh every 30 seconds like real NSE
    staleTime: 25000, // Data is fresh for 25 seconds
  });
};
