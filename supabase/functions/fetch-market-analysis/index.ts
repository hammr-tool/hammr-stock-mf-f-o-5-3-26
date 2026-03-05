import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisItem {
  id: string;
  title: string;
  time: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  tags: string[];
  category: string;
  priority: number;
  source?: string;
  url?: string;
}

interface MarketAuxArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  published_at: string;
  source: string;
  relevance_score: number | null;
  entities: Array<{
    symbol: string;
    name: string;
    type: string;
    sentiment_score: number | null;
  }>;
}

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const published = new Date(dateString);
  const diffMs = now.getTime() - published.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
};

const determineSentiment = (article: MarketAuxArticle): 'Bullish' | 'Bearish' | 'Neutral' => {
  // Check entity sentiment scores if available
  if (article.entities && article.entities.length > 0) {
    const avgSentiment = article.entities
      .filter(e => e.sentiment_score !== null)
      .reduce((acc, e) => acc + (e.sentiment_score || 0), 0) / article.entities.length;
    
    if (avgSentiment > 0.2) return 'Bullish';
    if (avgSentiment < -0.2) return 'Bearish';
  }
  
  // Keyword-based sentiment analysis
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  const bullishKeywords = ['surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'bullish', 'positive', 'growth', 'profit', 'record high', 'outperform', 'buy', 'upgrade', 'strong'];
  const bearishKeywords = ['fall', 'drop', 'decline', 'crash', 'plunge', 'bearish', 'negative', 'loss', 'weak', 'sell', 'downgrade', 'concern', 'risk', 'warning', 'fear'];
  
  const bullishCount = bullishKeywords.filter(kw => text.includes(kw)).length;
  const bearishCount = bearishKeywords.filter(kw => text.includes(kw)).length;
  
  if (bullishCount > bearishCount) return 'Bullish';
  if (bearishCount > bullishCount) return 'Bearish';
  return 'Neutral';
};

const determineCategory = (article: MarketAuxArticle): string => {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  if (text.includes('nifty') || text.includes('sensex') || text.includes('index')) return 'Index Analysis';
  if (text.includes('fii') || text.includes('dii') || text.includes('foreign') || text.includes('institutional')) return 'FII-DII Activity';
  if (text.includes('option') || text.includes('call') || text.includes('put') || text.includes('strike')) return 'Options Analysis';
  if (text.includes('rbi') || text.includes('fed') || text.includes('policy') || text.includes('rate')) return 'Economic News';
  if (text.includes('technical') || text.includes('chart') || text.includes('pattern') || text.includes('resistance') || text.includes('support')) return 'Technical Analysis';
  if (text.includes('sector') || text.includes('it ') || text.includes('pharma') || text.includes('bank') || text.includes('auto')) return 'Sector Analysis';
  if (text.includes('global') || text.includes('us market') || text.includes('asia') || text.includes('china')) return 'Global Impact';
  if (text.includes('earnings') || text.includes('result') || text.includes('quarter')) return 'Earnings';
  
  return 'Market Overview';
};

const extractTags = (article: MarketAuxArticle): string[] => {
  const tags: string[] = [];
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  // Extract entity symbols as tags
  if (article.entities) {
    article.entities.slice(0, 2).forEach(e => {
      if (e.symbol) tags.push(e.symbol);
    });
  }
  
  // Add category-based tags
  if (text.includes('nifty')) tags.push('Nifty');
  if (text.includes('sensex')) tags.push('Sensex');
  if (text.includes('bank nifty')) tags.push('Bank Nifty');
  if (text.includes('fii')) tags.push('FII');
  if (text.includes('dii')) tags.push('DII');
  if (text.includes('rbi')) tags.push('RBI');
  if (text.includes('option')) tags.push('Options');
  if (text.includes('it ') || text.includes('tech')) tags.push('IT');
  if (text.includes('pharma')) tags.push('Pharma');
  if (text.includes('auto')) tags.push('Auto');
  
  // Ensure we have at least some tags
  if (tags.length === 0) {
    tags.push('Market', 'News');
  }
  
  return [...new Set(tags)].slice(0, 4);
};

const fetchMarketNews = async (apiKey: string): Promise<AnalysisItem[]> => {
  // Get date for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const publishedAfter = sevenDaysAgo.toISOString().split('T')[0];
  
  // Fetch from multiple endpoints to get more diverse market news
  const queries = [
    // General Indian market news - recent only
    `https://api.marketaux.com/v1/news/all?countries=in&filter_entities=true&language=en&published_after=${publishedAfter}&api_token=${apiKey}&limit=50`,
    // Finance/Banking sector
    `https://api.marketaux.com/v1/news/all?countries=in&industries=Financial&language=en&published_after=${publishedAfter}&api_token=${apiKey}&limit=50`,
    // Stock market specific search
    `https://api.marketaux.com/v1/news/all?search=nifty+sensex+BSE+NSE&language=en&published_after=${publishedAfter}&api_token=${apiKey}&limit=50`,
    // RBI and economic news
    `https://api.marketaux.com/v1/news/all?search=RBI+interest+rate+inflation+India&language=en&published_after=${publishedAfter}&api_token=${apiKey}&limit=50`,
    // FII DII activity
    `https://api.marketaux.com/v1/news/all?search=FII+DII+institutional+investors+India&language=en&published_after=${publishedAfter}&api_token=${apiKey}&limit=50`,
  ];
  
  const allArticles: MarketAuxArticle[] = [];
  const seenIds = new Set<string>();
  
  for (const url of queries) {
    try {
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          for (const article of data.data) {
            // Deduplicate by UUID
            if (!seenIds.has(article.uuid)) {
              seenIds.add(article.uuid);
              allArticles.push(article);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching from query:', err);
    }
  }
  
  console.log(`Fetched ${allArticles.length} unique articles from MarketAux`);
  
  if (allArticles.length === 0) {
    console.log('No articles found, returning empty array');
    return [];
  }
  
  // Filter out articles older than 7 days
  const recentArticles = allArticles.filter(article => {
    const publishedDate = new Date(article.published_at);
    const daysDiff = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });
  
  console.log(`Filtered to ${recentArticles.length} recent articles (last 7 days)`);
  
  // Sort by published date (most recent first)
  recentArticles.sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  
  // Take top 15 articles (minimum 10 if available)
  const topArticles = recentArticles.slice(0, 15);
  
  const analyses: AnalysisItem[] = topArticles.map((article: MarketAuxArticle, index: number) => ({
    id: article.uuid || String(index + 1),
    title: article.title,
    time: getRelativeTime(article.published_at),
    summary: article.description || article.snippet || 'No description available.',
    sentiment: determineSentiment(article),
    tags: extractTags(article),
    category: determineCategory(article),
    priority: index < 5 ? 1 : index < 10 ? 2 : 3,
    source: article.source,
    url: article.url
  }));
  
  console.log(`Returning ${analyses.length} market analyses`);
  return analyses;
};

// Fallback data when API fails
const getFallbackAnalyses = (): AnalysisItem[] => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const formattedTime = istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  return [
    {
      id: '1',
      title: 'Market Analysis Currently Unavailable',
      time: 'Just now',
      summary: `Unable to fetch live market news at ${formattedTime} IST. Please check your internet connection or try again later. The market data service may be temporarily unavailable.`,
      sentiment: 'Neutral',
      tags: ['System', 'Notice'],
      category: 'System Notice',
      priority: 1
    }
  ];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching market analysis from MarketAux API...');
    
    const apiKey = Deno.env.get('MARKETAUX_API_KEY');
    
    if (!apiKey) {
      console.error('MARKETAUX_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          analyses: getFallbackAnalyses(),
          lastUpdated: new Date().toISOString(),
          error: 'API key not configured'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const analyses = await fetchMarketNews(apiKey);
    
    console.log(`Successfully processed ${analyses.length} market analyses`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        analyses: analyses.length > 0 ? analyses : getFallbackAnalyses(),
        lastUpdated: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching market analysis:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        analyses: getFallbackAnalyses(),
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
