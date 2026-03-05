import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const indicesConfig = [
      { name: 'NIFTY 50', symbols: ['^NSEI'] },
      { name: 'SENSEX', symbols: ['^BSESN', 'SENSEX.BO'] },
      { name: 'NIFTY BANK', symbols: ['^NSEBANK'] },
      { name: 'NIFTY IT', symbols: ['^CNXIT'] },
      { name: 'NIFTY FMCG', symbols: ['^CNXFMCG'] },
      { name: 'NIFTY PHARMA', symbols: ['^CNXPHARMA'] }
    ];

    const results = await Promise.all(
      indicesConfig.map(async ({ name, symbols }) => {
        for (const symbol of symbols) {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0'
                }
              }
            );
            const data = await response.json();

            const quote = data.chart?.result?.[0]?.meta;
            const regularMarketPrice = quote?.regularMarketPrice || 0;
            const previousClose = quote?.chartPreviousClose || quote?.previousClose || regularMarketPrice;

            // If price is clearly invalid, try next fallback symbol
            if (!regularMarketPrice || Number.isNaN(regularMarketPrice)) {
              throw new Error('Invalid market price');
            }

            const change = regularMarketPrice - previousClose;
            const changePercent = previousClose ? (change / previousClose) * 100 : 0;

            return {
              name,
              symbol,
              value: regularMarketPrice,
              change,
              changePercent
            };
          } catch (error) {
            console.error(`Error fetching ${name} with ${symbol}:`, error);
            // Try next symbol in the list
            continue;
          }
        }
        // All fallbacks failed for this index
        return null;
      })
    );

    const indices = results.filter((r): r is NonNullable<typeof r> => r !== null);

    return new Response(JSON.stringify({ indices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-market-indices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
