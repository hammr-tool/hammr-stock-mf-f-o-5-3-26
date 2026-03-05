import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateATMStrike(price: number, strikeInterval: number): number {
  return Math.round(price / strikeInterval) * strikeInterval;
}

// Get IST time details for consistency
function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function formatYMD(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function getISTDetails() {
  const now = new Date();

  // Robust IST extraction (no locale-string parsing).
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(now);

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

  const hours = Number(map.hour ?? 0);
  const minutes = Number(map.minute ?? 0);
  const day = weekdayMap[map.weekday ?? 'Sun'] ?? 0; // 0=Sun..6=Sat (IST)

  // Market is open Mon-Fri, 9:15 AM - 3:30 PM IST
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours =
    (hours > 9 || (hours === 9 && minutes >= 15)) &&
    (hours < 15 || (hours === 15 && minutes <= 30));
  const isMarketOpen = isWeekday && isMarketHours;

  // For non-market hours, freeze all simulated series to the latest trading day's close.
  const seedBaseDate = new Date(
    Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day))
  );

  if (!isWeekday) {
    // Weekend: use previous Friday.
    const diff = day === 6 ? 1 : 2; // Sat->Fri, Sun->Fri
    seedBaseDate.setUTCDate(seedBaseDate.getUTCDate() - diff);
  } else {
    // Weekday, but before market open: use previous trading day.
    const beforeOpen = hours < 9 || (hours === 9 && minutes < 15);
    if (beforeOpen) {
      const diff = day === 1 ? 3 : 1; // Mon morning -> Fri, else yesterday
      seedBaseDate.setUTCDate(seedBaseDate.getUTCDate() - diff);
    }
  }

  const ymd = formatYMD(seedBaseDate);

  // During market hours, values update only once per 5-minute block.
  // Outside market hours, values are fully stable (no time-based drift).
  const fiveMinuteBlock = Math.floor(minutes / 5);
  const dateSeed = isMarketOpen
    ? `${ymd}-${pad2(hours)}-${fiveMinuteBlock}`
    : `${ymd}-close`;

  return { hours, minutes, day, isMarketOpen, dateSeed, ymd };
}

// Simple seeded random for consistency within time blocks
function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
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
    const { isMarketOpen, dateSeed, ymd } = getISTDetails();

    // When market is closed, keep "as-of" timestamp stable at the close time.
    const asOfTimestamp = isMarketOpen
      ? new Date().toISOString()
      : `${ymd}T15:30:00+05:30`;

    console.log('Fetching live chart data for:', symbol, 'Market open:', isMarketOpen, 'Seed:', dateSeed);

    // Helper to return mock data
    const returnMockData = (mockPrice: number, mockPreviousClose: number) => {
      const mockChange = mockPrice - mockPreviousClose;
      const mockChangePercent = (mockChange / mockPreviousClose) * 100;
      const mockAtmStrike = calculateATMStrike(mockPrice, strikeInterval);
      
      return new Response(JSON.stringify({
        symbol,
        currentPrice: mockPrice,
        change: mockChange,
        changePercent: mockChangePercent,
        atmStrike: mockAtmStrike,
        previousClose: mockPreviousClose,
        dayHigh: mockPrice + 100,
        dayLow: mockPrice - 150,
        isMarketOpen,
        intradayPriceData: generateMockIntradayData(mockPrice, dateSeed, ymd),
        optionPremiumData: generateMockOptionData(mockAtmStrike, dateSeed, ymd),
        ivSmileData: generateMockIVData(mockAtmStrike, strikeInterval, dateSeed),
        timestamp: asOfTimestamp,
        usingMockData: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    };

    // Fetch intraday data (1 day, 5-minute intervals)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
    
    let data;
    try {
      const response = await fetchWithRetry(yahooUrl);
      data = await response.json();
    } catch (fetchError) {
      console.error('Yahoo Finance API error:', fetchError);
      // Return mock data when API fails
      return returnMockData(25600, 25765);
    }

    // Validate API response
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error('Invalid Yahoo Finance API response - no chart data');
      return returnMockData(25600, 25765);
    }

    const quote = data.chart.result[0];
    
    // Check if we have the required data, otherwise use mock data
    const hasValidData = quote.timestamp && quote.indicators?.quote?.[0];
    
    if (!hasValidData) {
      console.log('Missing timestamp or quote data, using mock data');
      const mockPrice = quote.meta?.regularMarketPrice || 25600;
      const mockPreviousClose = quote.meta?.chartPreviousClose || 25765;
      return returnMockData(mockPrice, mockPreviousClose);
    }
    
    const timestamps = quote.timestamp;
    const priceData = quote.indicators.quote[0];
    
    // Build intraday price chart data with IST timezone
    const intradayData = timestamps.map((ts: number, i: number) => ({
      time: new Date(ts * 1000).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      }),
      timestamp: ts,
      open: priceData.open[i],
      high: priceData.high[i],
      low: priceData.low[i],
      close: priceData.close[i],
      volume: priceData.volume[i]
    })).filter((d: any) => d.close !== null);

    const currentPrice = intradayData[intradayData.length - 1]?.close || 20000;
    const previousClose = quote.meta.chartPreviousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Calculate ATM strike
    const atmStrike = calculateATMStrike(currentPrice, strikeInterval);

    // Generate stable simulated option premium data using seeded random
    const optionPremiumData = intradayData.map((d: any, i: number) => {
      const timeDecay = 1 - (i / intradayData.length) * 0.1;
      const callVariation = seededRandom(dateSeed + 'call', i) * 30;
      const putVariation = seededRandom(dateSeed + 'put', i) * 25;
      
      return {
        time: d.time,
        timestamp: d.timestamp,
        callPremium: Math.max(0, (d.close - atmStrike) + 150 * timeDecay + callVariation),
        putPremium: Math.max(0, (atmStrike - d.close) + 120 * timeDecay + putVariation)
      };
    });

    // Generate stable IV smile data across strikes
    const ivSmileData = [];
    let strikeIndex = 0;
    for (let strike = atmStrike - 1000; strike <= atmStrike + 1000; strike += strikeInterval) {
      const atmDistance = Math.abs(strike - atmStrike);
      const baseIV = 18;
      const volatilitySmile = (atmDistance / 1000) * 5;
      const callVariation = seededRandom(dateSeed + 'ivCall', strikeIndex) * 2;
      const putVariation = seededRandom(dateSeed + 'ivPut', strikeIndex) * 2;
      
      ivSmileData.push({
        strike,
        callIV: baseIV + volatilitySmile + callVariation,
        putIV: baseIV + volatilitySmile + putVariation
      });
      strikeIndex++;
    }

    const result = {
      symbol,
      currentPrice,
      change,
      changePercent,
      atmStrike,
      previousClose,
      dayHigh: Math.max(...intradayData.map((d: any) => d.high)),
      dayLow: Math.min(...intradayData.map((d: any) => d.low)),
      isMarketOpen,
      intradayPriceData: intradayData,
      optionPremiumData,
      ivSmileData,
      timestamp: asOfTimestamp
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to generate stable mock intraday data
function generateMockIntradayData(currentPrice: number, dateSeed: string, ymd: string) {
  const data = [];
  const startTime = new Date(`${ymd}T09:15:00+05:30`);

  for (let i = 0; i < 78; i++) {
    const time = new Date(startTime.getTime() + i * 5 * 60 * 1000);
    // Use seeded random for consistent values within 5-minute blocks
    const randomChange = (seededRandom(dateSeed + 'intraday', i) - 0.5) * 100;
    const price = currentPrice + randomChange;

    data.push({
      time: time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }),
      timestamp: Math.floor(time.getTime() / 1000),
      open: price - 20,
      high: price + 30,
      low: price - 40,
      close: price,
      volume: Math.floor(seededRandom(dateSeed + 'volume', i) * 10000000),
    });
  }

  return data;
}

// Helper function to generate stable mock option premium data
function generateMockOptionData(atmStrike: number, dateSeed: string, ymd: string) {
  const data = [];
  const startTime = new Date(`${ymd}T09:15:00+05:30`);

  for (let i = 0; i < 78; i++) {
    const time = new Date(startTime.getTime() + i * 5 * 60 * 1000);
    const timeDecay = 1 - (i / 78) * 0.1;

    data.push({
      time: time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }),
      timestamp: Math.floor(time.getTime() / 1000),
      callPremium: 150 * timeDecay + seededRandom(dateSeed + 'mockCall', i) * 30,
      putPremium: 120 * timeDecay + seededRandom(dateSeed + 'mockPut', i) * 25,
    });
  }

  return data;
}

// Helper function to generate stable mock IV smile data
function generateMockIVData(atmStrike: number, strikeInterval: number, dateSeed: string) {
  const data = [];
  let index = 0;
  
  for (let strike = atmStrike - 1000; strike <= atmStrike + 1000; strike += strikeInterval) {
    const atmDistance = Math.abs(strike - atmStrike);
    const baseIV = 18;
    const volatilitySmile = (atmDistance / 1000) * 5;
    
    data.push({
      strike,
      callIV: baseIV + volatilitySmile + seededRandom(dateSeed + 'mockIVCall', index) * 2,
      putIV: baseIV + volatilitySmile + seededRandom(dateSeed + 'mockIVPut', index) * 2
    });
    index++;
  }
  
  return data;
}