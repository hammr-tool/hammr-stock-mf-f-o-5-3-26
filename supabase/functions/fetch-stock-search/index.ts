import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || query.length < 1) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search by symbol or company name (case-insensitive)
    const searchPattern = `%${query}%`;
    
    const { data: stocks, error } = await supabase
      .from("stocks")
      .select("id, symbol, company_name, exchange, current_price, change_percent, market_cap_category")
      .or(`symbol.ilike.${searchPattern},company_name.ilike.${searchPattern}`)
      .order("market_cap", { ascending: false, nullsFirst: false })
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    console.log(`Search for "${query}" returned ${stocks?.length || 0} results`);

    return new Response(
      JSON.stringify({ results: stocks || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-stock-search:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
