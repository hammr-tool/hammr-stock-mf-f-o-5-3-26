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
    const { symbol, strikeInterval } = await req.json();
    console.log('Fetching option data for:', symbol, 'with strike interval:', strikeInterval);

    // Fetch current price from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    const data = await response.json();
    const currentPrice = data.chart?.result?.[0]?.meta?.regularMarketPrice || 24000;

    // Create a time-based seed that changes every 5 minutes (like real NSE data)
    // This ensures data is stable between refreshes but updates periodically
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
    const timeSeed = Math.floor(istTime.getTime() / (5 * 60 * 1000)); // Changes every 5 minutes
    const dateSeed = istTime.getFullYear() * 10000 + (istTime.getMonth() + 1) * 100 + istTime.getDate();
    
    // Seeded random function for consistent values
    const seededRandom = (seed: number, offset: number = 0): number => {
      const x = Math.sin((seed + offset) * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // Generate option chain based on current price
    const numStrikes = 21;
    const atmStrike = Math.round(currentPrice / strikeInterval) * strikeInterval;
    const startStrike = atmStrike - (Math.floor(numStrikes / 2) * strikeInterval);

    const optionData = [];
    for (let i = 0; i < numStrikes; i++) {
      const strike = startStrike + (i * strikeInterval);
      const distanceFromAtm = Math.abs(strike - currentPrice);
      const strikeSeed = timeSeed + strike; // Unique seed per strike
      
      // Realistic OI distribution - higher near ATM, decreasing as we go OTM
      const oiMultiplier = Math.exp(-distanceFromAtm / 800);
      const baseCallOI = 80000 + seededRandom(strikeSeed, 1) * 120000 * oiMultiplier;
      const basePutOI = 80000 + seededRandom(strikeSeed, 2) * 120000 * oiMultiplier;
      
      // Volume is typically 10-30% of OI
      const callVolume = baseCallOI * (0.1 + seededRandom(strikeSeed, 3) * 0.2);
      const putVolume = basePutOI * (0.1 + seededRandom(strikeSeed, 4) * 0.2);
      
      // More realistic option pricing based on moneyness
      const intrinsicCall = Math.max(currentPrice - strike, 0);
      const intrinsicPut = Math.max(strike - currentPrice, 0);
      const timeValue = 150 * Math.exp(-distanceFromAtm / 600);
      
      const callPremium = intrinsicCall + timeValue + seededRandom(strikeSeed, 5) * 15;
      const putPremium = intrinsicPut + timeValue + seededRandom(strikeSeed, 6) * 15;
      
      // IV smile - higher IV for OTM options
      const baseIV = 14 + (distanceFromAtm / 1000) * 4;
      const callIV = baseIV + seededRandom(strikeSeed, 7) * 1.5;
      const putIV = baseIV + seededRandom(strikeSeed, 8) * 1.5;
      
      // Change based on previous day's close (seeded for consistency)
      const callChange = (seededRandom(dateSeed + strike, 9) - 0.5) * 30;
      const putChange = (seededRandom(dateSeed + strike, 10) - 0.5) * 30;
      
      // Calculate option Greeks
      const timeToExpiry = 30 / 365;
      
      // Delta calculation (simplified)
      const callDelta = strike < currentPrice ? 0.5 + (currentPrice - strike) / (2 * currentPrice) : 
                        strike > currentPrice ? 0.5 - (strike - currentPrice) / (2 * currentPrice) : 0.5;
      const putDelta = callDelta - 1;
      
      // Gamma (rate of change of delta)
      const gamma = 0.01 * Math.exp(-distanceFromAtm / 1000);
      
      // Theta (time decay) - negative for long positions
      const theta = -(callPremium / (timeToExpiry * 365)) / 10;
      
      // Vega (sensitivity to IV changes)
      const vega = callPremium * Math.sqrt(timeToExpiry) * 0.01;
      
      optionData.push({
        strike,
        call: {
          oi: Math.round(baseCallOI),
          volume: Math.round(callVolume),
          iv: Math.round(callIV * 100) / 100,
          ltp: Math.round(callPremium * 100) / 100,
          change: Math.round(callChange * 100) / 100,
          delta: Math.round(Math.max(0, Math.min(1, callDelta)) * 1000) / 1000,
          gamma: Math.round(gamma * 10000) / 10000,
          theta: Math.round(theta * 100) / 100,
          vega: Math.round(vega * 100) / 100
        },
        put: {
          oi: Math.round(basePutOI),
          volume: Math.round(putVolume),
          iv: Math.round(putIV * 100) / 100,
          ltp: Math.round(putPremium * 100) / 100,
          change: Math.round(putChange * 100) / 100,
          delta: Math.round(Math.max(-1, Math.min(0, putDelta)) * 1000) / 1000,
          gamma: Math.round(gamma * 10000) / 10000,
          theta: Math.round(theta * 100) / 100,
          vega: Math.round(vega * 100) / 100
        }
      });
    }

    return new Response(JSON.stringify({ optionData, currentPrice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-option-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
