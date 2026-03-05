import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to fetch with retry and exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First check if we have the stock in database
    const { data: existingStock, error: dbError } = await supabase
      .from("stocks")
      .select("*")
      .eq("symbol", symbol.toUpperCase())
      .single();

    if (dbError && dbError.code !== "PGRST116") {
      console.error("DB error:", dbError);
    }

    // Try to fetch fresh data from Yahoo Finance
    const yahooSymbol = `${symbol.toUpperCase()}.NS`;
    let yahooData = null;

    try {
      const response = await fetchWithRetry(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const result = data.chart?.result?.[0];
        const meta = result?.meta;
        const quote = result?.indicators?.quote?.[0];

        if (meta) {
          yahooData = {
            symbol: symbol.toUpperCase(),
            company_name: meta.shortName || meta.symbol || symbol.toUpperCase(),
            exchange: "NSE",
            current_price: meta.regularMarketPrice,
            previous_close: meta.previousClose || meta.chartPreviousClose,
            change_percent: meta.regularMarketPrice && meta.previousClose
              ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100)
              : 0,
            day_high: meta.regularMarketDayHigh,
            day_low: meta.regularMarketDayLow,
            week_52_high: meta.fiftyTwoWeekHigh,
            week_52_low: meta.fiftyTwoWeekLow,
            volume: meta.regularMarketVolume,
          };
        }
      }
    } catch (error) {
      console.log("Yahoo Finance fetch failed, using cached data:", error);
    }

    // Merge: use Yahoo for live prices, DB for fundamentals
    const stockData = existingStock && yahooData
      ? { ...existingStock, ...yahooData }
      : yahooData || existingStock;

    if (!stockData) {
      return new Response(
        JSON.stringify({ error: "Stock not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get financials and shareholding if available
    let financials = null;
    let shareholding = null;

    if (existingStock?.id) {
      const [financialsResult, shareholdingResult] = await Promise.all([
        supabase
          .from("stock_financials")
          .select("*")
          .eq("stock_id", existingStock.id)
          .order("period_end_date", { ascending: false })
          .limit(12),
        supabase
          .from("stock_shareholding")
          .select("*")
          .eq("stock_id", existingStock.id)
          .order("quarter_end_date", { ascending: false })
          .limit(8),
      ]);

      financials = financialsResult.data;
      shareholding = shareholdingResult.data;
    }

    return new Response(
      JSON.stringify({
        stock: stockData,
        financials: financials || [],
        shareholding: shareholding || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-stock-details:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
