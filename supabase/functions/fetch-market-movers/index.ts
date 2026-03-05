import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to fetch with retry
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

// Generate realistic mock data for gainers/losers
function generateMockMovers(type: "gainers" | "losers", marketCap?: string) {
  const stocksData = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Oil & Gas", cap: "Large Cap" },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd", sector: "IT", cap: "Large Cap" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking", cap: "Large Cap" },
    { symbol: "INFY", name: "Infosys Ltd", sector: "IT", cap: "Large Cap" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking", cap: "Large Cap" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecom", cap: "Large Cap" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "FMCG", cap: "Large Cap" },
    { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", cap: "Large Cap" },
    { symbol: "SBIN", name: "State Bank of India", sector: "Banking", cap: "Large Cap" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Auto", cap: "Large Cap" },
    { symbol: "PIDILITIND", name: "Pidilite Industries Ltd", sector: "Chemicals", cap: "Mid Cap" },
    { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd", sector: "Finance", cap: "Mid Cap" },
    { symbol: "VOLTAS", name: "Voltas Ltd", sector: "Consumer Durables", cap: "Mid Cap" },
    { symbol: "AUROPHARMA", name: "Aurobindo Pharma Ltd", sector: "Pharma", cap: "Mid Cap" },
    { symbol: "TATAELXSI", name: "Tata Elxsi Ltd", sector: "IT", cap: "Mid Cap" },
    { symbol: "PERSISTENT", name: "Persistent Systems Ltd", sector: "IT", cap: "Mid Cap" },
    { symbol: "COFORGE", name: "Coforge Ltd", sector: "IT", cap: "Mid Cap" },
    { symbol: "POLYCAB", name: "Polycab India Ltd", sector: "Cables", cap: "Mid Cap" },
    { symbol: "ROUTE", name: "Route Mobile Ltd", sector: "IT", cap: "Small Cap" },
    { symbol: "TANLA", name: "Tanla Platforms Ltd", sector: "IT", cap: "Small Cap" },
    { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd", sector: "Banking", cap: "Small Cap" },
    { symbol: "RBLBANK", name: "RBL Bank Ltd", sector: "Banking", cap: "Small Cap" },
    { symbol: "NATIONALUM", name: "National Aluminium Co Ltd", sector: "Metals", cap: "Small Cap" },
    { symbol: "HUDCO", name: "HUDCO Ltd", sector: "Finance", cap: "Small Cap" },
    { symbol: "IRFC", name: "Indian Railway Finance Corp", sector: "Finance", cap: "Small Cap" },
    { symbol: "RVNL", name: "Rail Vikas Nigam Ltd", sector: "Infrastructure", cap: "Small Cap" },
  ];

  let filtered = stocksData;
  if (marketCap) {
    filtered = stocksData.filter(s => s.cap === marketCap);
  }

  // Shuffle and pick random stocks
  const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);

  const today = new Date();
  const seed = today.getDate() + today.getMonth() * 31;

  return shuffled.map((stock, index) => {
    const baseSeed = seed + stock.symbol.charCodeAt(0) + index;
    const pseudoRandom = (offset: number) => {
      const x = Math.sin(baseSeed + offset) * 10000;
      return x - Math.floor(x);
    };

    const changePercent = type === "gainers"
      ? (2 + pseudoRandom(1) * 8) // +2% to +10%
      : -(2 + pseudoRandom(2) * 6); // -2% to -8%

    const basePrice = 100 + pseudoRandom(3) * 4900;
    const currentPrice = Math.round(basePrice * 100) / 100;
    const previousClose = currentPrice / (1 + changePercent / 100);

    return {
      symbol: stock.symbol,
      company_name: stock.name,
      sector: stock.sector,
      market_cap_category: stock.cap,
      current_price: currentPrice,
      previous_close: Math.round(previousClose * 100) / 100,
      change_percent: Math.round(changePercent * 100) / 100,
      volume: Math.round(1000000 + pseudoRandom(4) * 50000000),
    };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = "gainers", marketCap } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First try to get from database
    let query = supabase
      .from("stocks")
      .select("symbol, company_name, sector, market_cap_category, current_price, previous_close, change_percent, volume")
      .not("change_percent", "is", null);

    if (marketCap) {
      query = query.eq("market_cap_category", marketCap);
    }

    if (type === "gainers") {
      query = query.gt("change_percent", 0).order("change_percent", { ascending: false });
    } else {
      query = query.lt("change_percent", 0).order("change_percent", { ascending: true });
    }

    const { data: stocks, error } = await query.limit(5);

    if (error) {
      console.error("DB error:", error);
    }

    // If we have data from DB, use it
    if (stocks && stocks.length > 0) {
      return new Response(
        JSON.stringify({ movers: stocks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Otherwise generate mock data
    const mockMovers = generateMockMovers(type, marketCap);

    return new Response(
      JSON.stringify({ movers: mockMovers }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-market-movers:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
