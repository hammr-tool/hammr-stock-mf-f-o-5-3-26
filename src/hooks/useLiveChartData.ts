import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntradayDataPoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OptionPremiumDataPoint {
  time: string;
  timestamp: number;
  callPremium: number;
  putPremium: number;
}

export interface IVDataPoint {
  strike: number;
  callIV: number;
  putIV: number;
}

export interface LiveChartData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  atmStrike: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  isMarketOpen: boolean;
  intradayPriceData: IntradayDataPoint[];
  optionPremiumData: OptionPremiumDataPoint[];
  ivSmileData: IVDataPoint[];
  timestamp: string;
}

// Check if NSE market is open (Mon-Fri, 9:15 AM - 3:30 PM IST)
function isMarketOpen(): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date());

  const map = Object.fromEntries(
    parts
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = weekdayMap[map.weekday ?? 'Sun'] ?? 0;
  const hours = Number(map.hour ?? 0);
  const minutes = Number(map.minute ?? 0);

  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours =
    (hours > 9 || (hours === 9 && minutes >= 15)) &&
    (hours < 15 || (hours === 15 && minutes <= 30));

  return isWeekday && isMarketHours;
}

export const useLiveChartData = (symbol: string, strikeInterval: number) => {
  const marketOpen = isMarketOpen();

  return useQuery({
    queryKey: ['live-chart-data', symbol, strikeInterval],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-live-chart-data', {
        body: { symbol, strikeInterval }
      });

      if (error) throw error;
      return data as LiveChartData;
    },
    // During market hours: poll every 3 seconds (same as other pages).
    // Outside market hours: do not poll (keeps charts fully stable).
    refetchInterval: marketOpen ? 3000 : false,
    staleTime: marketOpen ? 2000 : Infinity,
    refetchOnWindowFocus: marketOpen,
    refetchOnReconnect: marketOpen,
    enabled: !!symbol,
  });
};
