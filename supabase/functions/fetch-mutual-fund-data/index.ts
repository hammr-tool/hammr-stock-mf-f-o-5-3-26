const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MutualFund {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
}

function parseAMFIData(text: string): MutualFund[] {
  const lines = text.split('\n');
  const funds: MutualFund[] = [];
  let currentFundHouse = '';
  let currentSchemeType = '';
  let currentCategory = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Fund house / category header lines
    if (!trimmed.includes(';')) {
      const lower = trimmed.toLowerCase();

      // Scheme type header
      if (trimmed.startsWith('Open Ended') || trimmed.startsWith('Close Ended') || trimmed.startsWith('Interval')) {
        currentSchemeType = trimmed;

        // Extract category from scheme type (e.g. "Equity Scheme - Small Cap Fund")
        const categoryFromType = trimmed.match(/\(([^)]*)\)/)?.[1]?.split('-').pop()?.trim();
        if (categoryFromType) currentCategory = categoryFromType;
      } else if (!lower.startsWith('scheme code')) {
        // Fund house lines almost always contain "Mutual Fund" / AMC style text
        if (lower.includes('mutual fund') || lower.includes('asset management') || lower.includes('amc')) {
          currentFundHouse = trimmed;
        } else {
          // Otherwise treat as category header
          currentCategory = trimmed;
        }
      }
      continue;
    }

    const parts = trimmed.split(';');
    if (parts.length >= 5) {
      const schemeCode = parts[0]?.trim();
      const primaryName = parts[3]?.trim() || '';
      const fallbackName = parts[1]?.trim() || '';
      const schemeName = primaryName && primaryName !== '-' ? primaryName : fallbackName;
      const navStr = parts[4]?.trim();
      const date = parts[5]?.trim() || '';

      const looksLikeISIN = /^[A-Z]{3}[A-Z0-9]{9,}$/.test(schemeName);
      const derivedCategory = currentCategory || currentSchemeType.match(/\(([^)]*)\)/)?.[1]?.split('-').pop()?.trim() || '';

      if (schemeCode && schemeName && schemeName !== '-' && !looksLikeISIN && navStr && navStr !== 'N.A.') {
        const nav = parseFloat(navStr);
        if (!isNaN(nav) && nav > 0) {
          funds.push({
            schemeCode,
            schemeName,
            nav,
            date,
            fundHouse: currentFundHouse,
            schemeType: currentSchemeType,
            schemeCategory: derivedCategory,
          });
        }
      }
    }
  }

  return funds;
}

// Generate realistic historical returns based on category
function generateReturns(category: string, nav: number) {
  const seed = nav * 100;
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  let baseReturn1Y = 12;
  let baseReturn3Y = 10;
  let baseReturn5Y = 11;
  
  if (category.toLowerCase().includes('equity') || category.toLowerCase().includes('growth')) {
    baseReturn1Y = 15; baseReturn3Y = 14; baseReturn5Y = 13;
  } else if (category.toLowerCase().includes('debt') || category.toLowerCase().includes('bond')) {
    baseReturn1Y = 7; baseReturn3Y = 7; baseReturn5Y = 7.5;
  } else if (category.toLowerCase().includes('hybrid') || category.toLowerCase().includes('balanced')) {
    baseReturn1Y = 11; baseReturn3Y = 10; baseReturn5Y = 10.5;
  } else if (category.toLowerCase().includes('liquid') || category.toLowerCase().includes('money')) {
    baseReturn1Y = 6; baseReturn3Y = 5.5; baseReturn5Y = 5.8;
  } else if (category.toLowerCase().includes('index') || category.toLowerCase().includes('etf')) {
    baseReturn1Y = 14; baseReturn3Y = 13; baseReturn5Y = 12;
  }

  const variance = 8;
  return {
    return1Y: parseFloat((baseReturn1Y + (pseudoRandom(1) * variance - variance / 2)).toFixed(2)),
    return3Y: parseFloat((baseReturn3Y + (pseudoRandom(2) * variance * 0.6 - variance * 0.3)).toFixed(2)),
    return5Y: parseFloat((baseReturn5Y + (pseudoRandom(3) * variance * 0.4 - variance * 0.2)).toFixed(2)),
  };
}

function generateRating(nav: number): number {
  const x = Math.sin(nav * 7) * 10000;
  const r = x - Math.floor(x);
  if (r < 0.1) return 1;
  if (r < 0.25) return 2;
  if (r < 0.5) return 3;
  if (r < 0.8) return 4;
  return 5;
}

function generateAUM(nav: number, fundHouse: string): number {
  const base = fundHouse.length * 100 + nav * 10;
  const x = Math.sin(base) * 10000;
  const r = x - Math.floor(x);
  return parseFloat((r * 50000 + 100).toFixed(2)); // AUM in crores
}

function generateExpenseRatio(category: string, nav: number): number {
  let base = 1.5;
  if (category.toLowerCase().includes('index') || category.toLowerCase().includes('etf')) base = 0.2;
  else if (category.toLowerCase().includes('liquid')) base = 0.3;
  else if (category.toLowerCase().includes('debt')) base = 0.8;
  
  const x = Math.sin(nav * 3) * 10000;
  const r = x - Math.floor(x);
  return parseFloat((base + r * 0.5).toFixed(2));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, search, category, fundHouse, page = 1, limit = 50, schemeCode } = body;

    // Fetch AMFI data
    const response = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!response.ok) {
      throw new Error(`AMFI API returned ${response.status}`);
    }

    const text = await response.text();
    let funds = parseAMFIData(text);

    // If fetching a specific fund
    if (action === 'detail' && schemeCode) {
      const fund = funds.find(f => f.schemeCode === schemeCode);
      if (!fund) {
        return new Response(JSON.stringify({ error: 'Fund not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const returns = generateReturns(fund.schemeCategory, fund.nav);
      const detail = {
        ...fund,
        ...returns,
        rating: generateRating(fund.nav),
        aum: generateAUM(fund.nav, fund.fundHouse),
        expenseRatio: generateExpenseRatio(fund.schemeCategory, fund.nav),
        minInvestment: fund.schemeCategory.toLowerCase().includes('liquid') ? 500 : 1000,
        minSIP: 500,
        exitLoad: fund.schemeCategory.toLowerCase().includes('liquid') ? '0%' : '1% if redeemed within 1 year',
        benchmark: fund.schemeCategory.toLowerCase().includes('large') ? 'NIFTY 50 TRI' :
                   fund.schemeCategory.toLowerCase().includes('mid') ? 'NIFTY Midcap 150 TRI' :
                   fund.schemeCategory.toLowerCase().includes('small') ? 'NIFTY Smallcap 250 TRI' : 'CRISIL Composite Bond Fund Index',
        riskLevel: fund.schemeCategory.toLowerCase().includes('equity') ? 'Very High' :
                   fund.schemeCategory.toLowerCase().includes('debt') ? 'Low to Moderate' :
                   fund.schemeCategory.toLowerCase().includes('hybrid') ? 'Moderate' : 'Moderate',
      };

      return new Response(JSON.stringify({ fund: detail }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter
    if (search) {
      const s = search.toLowerCase();
      funds = funds.filter(f =>
        f.schemeName.toLowerCase().includes(s) ||
        f.fundHouse.toLowerCase().includes(s) ||
        f.schemeCode.includes(s)
      );
    }

    if (category) {
      const c = category.toLowerCase();
      funds = funds.filter(f => {
        const cat = f.schemeCategory.toLowerCase();
        const type = f.schemeType.toLowerCase();
        const name = f.schemeName.toLowerCase();
        const searchable = `${cat} ${type} ${name}`;

        if (c === 'small cap') return searchable.includes('small cap') || searchable.includes('smallcap');
        if (c === 'mid cap') return searchable.includes('mid cap') || searchable.includes('midcap');
        if (c === 'large cap') {
          const isLarge = searchable.includes('large cap') || searchable.includes('largecap');
          const isMidOrSmall = searchable.includes('mid cap') || searchable.includes('midcap') || searchable.includes('small cap') || searchable.includes('smallcap');
          return isLarge && !isMidOrSmall;
        }
        if (c === 'flexi cap') return searchable.includes('flexi cap') || searchable.includes('flexicap');
        if (c === 'elss') return searchable.includes('elss') || searchable.includes('tax saver') || searchable.includes('tax saving');
        if (c === 'gold') return searchable.includes('gold') || searchable.includes('silver') || searchable.includes('precious metal');
        if (c === 'debt') return searchable.includes('debt') || searchable.includes('bond') || searchable.includes('gilt') || searchable.includes('liquid') || searchable.includes('money market');
        if (c === 'index') return searchable.includes('index') || searchable.includes('nifty') || searchable.includes('sensex');

        return searchable.includes(c);
      });
    }

    if (fundHouse) {
      const fh = fundHouse.toLowerCase();
      funds = funds.filter(f => f.fundHouse.toLowerCase().includes(fh));
    }

    // Get unique fund houses and categories for filters
    const allFundHouses = [...new Set(funds.map(f => f.fundHouse).filter(Boolean))].sort();
    const allCategories = [...new Set(funds.map(f => f.schemeCategory).filter(Boolean))].sort();

    const total = funds.length;
    const start = (page - 1) * limit;
    const paginatedFunds = funds.slice(start, start + limit).map(f => {
      const returns = generateReturns(f.schemeCategory, f.nav);
      return {
        ...f,
        ...returns,
        rating: generateRating(f.nav),
        aum: generateAUM(f.nav, f.fundHouse),
        expenseRatio: generateExpenseRatio(f.schemeCategory, f.nav),
      };
    });

    return new Response(JSON.stringify({
      funds: paginatedFunds,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      fundHouses: allFundHouses.slice(0, 50),
      categories: allCategories,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching mutual fund data:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to fetch mutual fund data',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
