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
      // Indian Markets
      { name: 'NIFTY 50', symbols: ['^NSEI'] },
      { name: 'SENSEX', symbols: ['^BSESN'] },
      { name: 'NIFTY BANK', symbols: ['^NSEBANK'] },
      { name: 'INDIA VIX', symbols: ['^INDIAVIX'] },
      
      // Note: SGX Nifty (GIFT NIFTY) is not available via Yahoo Finance free API
      
      // US Markets
      { name: 'DOW JONES', symbols: ['^DJI'] },
      { name: 'NASDAQ', symbols: ['^IXIC'] },
      { name: 'S&P 500', symbols: ['^GSPC'] },
      { name: 'RUSSELL 2000', symbols: ['^RUT'] },
      
      // Asian Markets
      { name: 'NIKKEI 225', symbols: ['^N225'] },
      
      // Commodities
      { name: 'GOLD', symbols: ['GC=F'] },
      { name: 'SILVER', symbols: ['SI=F'] },
    ];

    console.log('Fetching global market data for', indicesConfig.length, 'indices');

    const results = await Promise.all(
      indicesConfig.map(async ({ name, symbols }) => {
        for (const symbol of symbols) {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              }
            );
            
            if (!response.ok) {
              console.log(`HTTP error for ${name} with ${symbol}: ${response.status}`);
              continue;
            }
            
            const data = await response.json();
            const result = data.chart?.result?.[0];
            
            if (!result) {
              console.log(`No result data for ${name} with ${symbol}`);
              continue;
            }

            const meta = result.meta;
            const regularMarketPrice = meta?.regularMarketPrice;
            const previousClose = meta?.chartPreviousClose || meta?.previousClose;
            const regularMarketTime = meta?.regularMarketTime;

            if (!regularMarketPrice || Number.isNaN(regularMarketPrice)) {
              console.log(`Invalid price for ${name} with ${symbol}`);
              continue;
            }

            const change = regularMarketPrice - (previousClose || regularMarketPrice);
            const changePercent = previousClose ? (change / previousClose) * 100 : 0;

            // Convert Unix timestamp to ISO string
            const lastUpdated = regularMarketTime 
              ? new Date(regularMarketTime * 1000).toISOString()
              : new Date().toISOString();

            console.log(`Successfully fetched ${name}: ${regularMarketPrice}`);

            return {
              name,
              symbol,
              value: regularMarketPrice,
              change,
              changePercent,
              lastUpdated
            };
          } catch (error) {
            console.error(`Error fetching ${name} with ${symbol}:`, error);
            continue;
          }
        }
        console.log(`All symbols failed for ${name}`);
        return null;
      })
    );

    const indices = results.filter((r): r is NonNullable<typeof r> => r !== null);
    console.log(`Successfully fetched ${indices.length} out of ${indicesConfig.length} indices`);

    return new Response(JSON.stringify({ indices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-global-market:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
