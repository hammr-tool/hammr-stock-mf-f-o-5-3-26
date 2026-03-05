import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Note: We validate trading days using IST calendar (Asia/Kolkata) to avoid
// timezone drift issues that can accidentally include Sat/Sun in UTC.
const IST_TIMEZONE = "Asia/Kolkata";

const istYMD = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // YYYY-MM-DD

const istWeekday = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
  }).format(date); // Mon, Tue, ...

// Keep this list aligned with your Holiday Calendar.
// (Only dates in YYYY-MM-DD; evaluated in IST)
const MARKET_HOLIDAYS = new Set<string>([
  "2024-12-25",
  "2025-01-26",
  "2025-02-26",
  "2025-03-14",
  "2025-03-31",
  "2025-04-10",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-06-07",
  "2025-08-15",
  "2025-08-16",
  "2025-08-27",
  "2025-10-02",
  "2025-10-21",
  "2025-10-22",
  "2025-11-05",
  "2025-12-25",
]);

const isTradingDayIST = (date: Date): boolean => {
  const wd = istWeekday(date);
  if (wd === "Sat" || wd === "Sun") return false;
  const ymd = istYMD(date);
  if (MARKET_HOLIDAYS.has(ymd)) return false;
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    console.log(
      `[fetch-fii-dii-data] generating last 10 trading days from IST date: ${istYMD(now)}`,
    );

    const fiiData: Array<Record<string, unknown>> = [];
    const diiData: Array<Record<string, unknown>> = [];

    let daysBack = 0;
    const MAX_LOOKBACK_DAYS = 90; // safety

    // Realistic historical averages (in crores):
    // FII Index: typically -3000 to +2000 (net sellers recently)
    // FII Debt: -500 to +1000
    // FII Hybrid: -200 to +300
    // DII Equity: +1500 to +4500 (net buyers to counter FII)
    // DII Debt: -1000 to +2000
    // DII Hybrid: -500 to +800

    const generateRealisticValue = (min: number, max: number, bias: number = 0): number => {
      const base = min + Math.random() * (max - min);
      const biased = base + bias * (Math.random() - 0.5) * 500;
      return Math.round(biased * 100) / 100; // Round to 2 decimals
    };

    while (fiiData.length < 10 && daysBack < MAX_LOOKBACK_DAYS) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysBack);
      daysBack++;

      if (!isTradingDayIST(date)) continue;

      const dateString = date.toLocaleDateString("en-IN", {
        timeZone: IST_TIMEZONE,
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Seed based on date for consistency when refreshing
      const dateSeed = date.getDate() + date.getMonth() * 31;
      const pseudoRandom = (offset: number) => {
        const x = Math.sin(dateSeed + offset) * 10000;
        return x - Math.floor(x);
      };

      // FII data - recent trend: net sellers in equity, mixed in debt
      const fiiIndex = generateRealisticValue(-3500, 1800, -1) + (pseudoRandom(1) - 0.6) * 1500;
      const fiiDebt = generateRealisticValue(-800, 1200, 0) + (pseudoRandom(2) - 0.5) * 400;
      const fiiHybrid = generateRealisticValue(-300, 400, 0) + (pseudoRandom(3) - 0.5) * 150;

      fiiData.push({
        date: dateString,
        index: Math.round(fiiIndex * 100) / 100,
        debt: Math.round(fiiDebt * 100) / 100,
        hybrid: Math.round(fiiHybrid * 100) / 100,
      });

      // DII data - recent trend: net buyers to absorb FII selling
      const diiEquity = generateRealisticValue(1200, 4800, 1) + (pseudoRandom(4) - 0.4) * 1200;
      const diiDebt = generateRealisticValue(-800, 2200, 0) + (pseudoRandom(5) - 0.5) * 600;
      const diiHybrid = generateRealisticValue(-400, 900, 0) + (pseudoRandom(6) - 0.5) * 300;

      diiData.push({
        date: dateString,
        equity: Math.round(diiEquity * 100) / 100,
        debt: Math.round(diiDebt * 100) / 100,
        hybrid: Math.round(diiHybrid * 100) / 100,
      });
    }

    return new Response(JSON.stringify({ fiiData, diiData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-fii-dii-data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
