import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to calculate ATM strike
function calculateATMStrike(price: number, strikeInterval: number): number {
  return Math.round(price / strikeInterval) * strikeInterval;
}

// Technical indicator calculators
function calculateRSI(prices: number[], period: number = 14): number {
  // Wilder's RSI (same method used by most charting platforms)
  // Needs at least (period + 1) prices to compute period changes
  if (prices.length < period + 1) return 50;

  let avgGain = 0;
  let avgLoss = 0;

  // Initial average gain/loss over the first "period" changes
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += -change;
  }

  avgGain /= period;
  avgLoss /= period;

  // Wilder smoothing for the remaining prices
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  if (avgGain === 0) return 0;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
  if (prices.length < 35) {
    return { value: 0, signal: 0, histogram: 0 };
  }
  
  // Calculate MACD line values for the last 9 periods to get signal line
  const macdValues: number[] = [];
  for (let i = Math.max(26, prices.length - 20); i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const ema12 = calculateEMA(slice, 12);
    const ema26 = calculateEMA(slice, 26);
    macdValues.push(ema12 - ema26);
  }
  
  const currentMacd = macdValues[macdValues.length - 1];
  
  // Calculate 9-period EMA of MACD values for signal line
  const signalLine = calculateEMAFromValues(macdValues, 9);
  const histogram = currentMacd - signalLine;
  
  return { value: currentMacd, signal: signalLine, histogram };
}

function calculateEMAFromValues(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b) / period;
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev)
  };
}

// Helper function to fetch with retry and rate limit handling
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status === 429) {
      console.log(`Rate limited, attempt ${attempt + 1}/${maxRetries}, waiting...`);
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
      continue;
    }
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`HTTP error ${response.status}: ${text.substring(0, 100)}`);
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
    
    return response;
  }
  throw new Error('Max retries exceeded due to rate limiting');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, strikeInterval } = await req.json();
    console.log('Fetching technical data for:', symbol, 'with strike interval:', strikeInterval);

    // Fetch 15-minute interval data from Yahoo Finance (last 60 days max for 15m)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=60d&interval=15m`;
    
    let data;
    try {
      const response = await fetchWithRetry(yahooUrl);
      data = await response.json();
    } catch (fetchError) {
      console.error('Yahoo Finance API error:', fetchError);
      // Return graceful error response
      return new Response(JSON.stringify({ 
        error: 'Market data temporarily unavailable. Please try again in a few seconds.',
        retryAfter: 5
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data?.chart?.result?.[0]) {
      console.error('Invalid response structure:', JSON.stringify(data).substring(0, 200));
      return new Response(JSON.stringify({ 
        error: 'Invalid market data received. Please try again.',
        retryAfter: 3
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const quote = data.chart.result[0];
    const closePrices = quote.indicators?.quote?.[0]?.close;
    
    if (!closePrices || closePrices.length === 0) {
      console.error('No price data in response');
      return new Response(JSON.stringify({ 
        error: 'No price data available. Market may be closed.',
        retryAfter: 60
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const historicalPrices = closePrices.filter((p: number) => p !== null);
    
    console.log('Fetched 15m candles:', historicalPrices.length);
    
    // Get current price and previous close from metadata
    const currentPrice = quote.meta?.regularMarketPrice || historicalPrices[historicalPrices.length - 1];
    const previousClose = quote.meta?.previousClose || quote.meta?.chartPreviousClose || historicalPrices[historicalPrices.length - 2];
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    console.log('Price data (15m timeframe):', { currentPrice, previousClose, change, changePercent, totalCandles: historicalPrices.length });

    // Use historical 15m prices with current price as latest
    const prices = [...historicalPrices];
    prices[prices.length - 1] = currentPrice;
    
    console.log('Using 15m prices for calculation - last 5:', prices.slice(-5));

    // Calculate ATM strike
    const atmStrike = calculateATMStrike(currentPrice, strikeInterval);

    // Calculate all technical indicators using prices with current live price
    const rsi14 = calculateRSI(prices, 14);
    const rsi9 = calculateRSI(prices, 9);
    const macd = calculateMACD(prices);
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const sma100 = calculateSMA(prices, 100);
    const sma200 = calculateSMA(prices, 200);
    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const bb = calculateBollingerBands(prices);
    
    console.log('Calculated RSI(9):', rsi9.toFixed(2), 'RSI(14):', rsi14.toFixed(2));

    // Build indicators array with signals
    const indicators = [
      {
        category: 'Momentum',
        name: 'RSI (14)',
        value: rsi14.toFixed(2),
        signal: rsi14 > 70 ? 'Overbought' : rsi14 < 30 ? 'Oversold' : rsi14 > 50 ? 'Bullish' : 'Bearish',
        strength: Math.abs(rsi14 - 50) * 2
      },
      {
        category: 'Momentum',
        name: 'RSI (9)',
        value: rsi9.toFixed(2),
        signal: rsi9 > 70 ? 'Overbought' : rsi9 < 30 ? 'Oversold' : rsi9 > 50 ? 'Bullish' : 'Bearish',
        strength: Math.abs(rsi9 - 50) * 2
      },
      {
        category: 'Trend',
        name: 'MACD',
        value: `${macd.value.toFixed(2)} / ${macd.signal.toFixed(2)}`,
        signal: macd.histogram > 0 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(macd.histogram) * 10, 100)
      },
      {
        category: 'Moving Average',
        name: 'SMA (20)',
        value: sma20.toFixed(2),
        signal: currentPrice > sma20 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - sma20) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Moving Average',
        name: 'SMA (50)',
        value: sma50.toFixed(2),
        signal: currentPrice > sma50 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - sma50) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Moving Average',
        name: 'SMA (100)',
        value: sma100.toFixed(2),
        signal: currentPrice > sma100 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - sma100) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Moving Average',
        name: 'SMA (200)',
        value: sma200.toFixed(2),
        signal: currentPrice > sma200 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - sma200) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Moving Average',
        name: 'EMA (20)',
        value: ema20.toFixed(2),
        signal: currentPrice > ema20 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - ema20) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Moving Average',
        name: 'EMA (50)',
        value: ema50.toFixed(2),
        signal: currentPrice > ema50 ? 'Bullish' : 'Bearish',
        strength: Math.min(Math.abs(currentPrice - ema50) / currentPrice * 100 * 20, 100)
      },
      {
        category: 'Volatility',
        name: 'Bollinger Bands',
        value: `${bb.upper.toFixed(2)} / ${bb.lower.toFixed(2)}`,
        signal: currentPrice > bb.upper ? 'Overbought' : currentPrice < bb.lower ? 'Oversold' : 'Neutral',
        strength: currentPrice > bb.upper ? Math.min((currentPrice - bb.upper) / bb.upper * 100 * 10, 100) : 
                  currentPrice < bb.lower ? Math.min((bb.lower - currentPrice) / bb.lower * 100 * 10, 100) : 50
      }
    ];

    // Calculate overall recommendation
    const bullishCount = indicators.filter(i => i.signal === 'Bullish').length;
    const bearishCount = indicators.filter(i => i.signal === 'Bearish').length;
    const neutralCount = indicators.filter(i => i.signal === 'Neutral' || i.signal === 'Overbought' || i.signal === 'Oversold').length;
    const total = indicators.length;
    
    const bullishPercent = (bullishCount / total) * 100;
    const bearishPercent = (bearishCount / total) * 100;
    
    let recommendation = 'Neutral';
    let confidence = 50;
    
    if (bullishPercent > 70) {
      recommendation = 'Strong Bullish';
      confidence = Math.round(bullishPercent);
    } else if (bullishPercent > 55) {
      recommendation = 'Bullish';
      confidence = Math.round(bullishPercent);
    } else if (bearishPercent > 70) {
      recommendation = 'Strong Bearish';
      confidence = Math.round(bearishPercent);
    } else if (bearishPercent > 55) {
      recommendation = 'Bearish';
      confidence = Math.round(bearishPercent);
    } else {
      confidence = Math.round(50 + Math.abs(bullishPercent - bearishPercent) / 2);
    }

    const result = {
      symbol,
      currentPrice,
      change,
      changePercent,
      atmStrike,
      indicators,
      recommendation: {
        action: recommendation,
        confidence,
        bullishCount,
        bearishCount,
        neutralCount
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      retryAfter: 5
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
