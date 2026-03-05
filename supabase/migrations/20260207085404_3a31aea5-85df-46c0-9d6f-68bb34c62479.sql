-- Create stocks master table
CREATE TABLE public.stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  sector TEXT,
  industry TEXT,
  market_cap DECIMAL,
  market_cap_category TEXT CHECK (market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap')),
  current_price DECIMAL,
  previous_close DECIMAL,
  change_percent DECIMAL,
  day_high DECIMAL,
  day_low DECIMAL,
  week_52_high DECIMAL,
  week_52_low DECIMAL,
  volume BIGINT,
  pe_ratio DECIMAL,
  pb_ratio DECIMAL,
  dividend_yield DECIMAL,
  eps DECIMAL,
  book_value DECIMAL,
  roe DECIMAL,
  roce DECIMAL,
  face_value DECIMAL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stock financials table for quarterly/annual data
CREATE TABLE public.stock_financials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('quarterly', 'annual')),
  period_end_date DATE NOT NULL,
  revenue DECIMAL,
  net_profit DECIMAL,
  operating_profit DECIMAL,
  ebitda DECIMAL,
  total_assets DECIMAL,
  total_liabilities DECIMAL,
  total_equity DECIMAL,
  total_debt DECIMAL,
  cash_and_equivalents DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(stock_id, period_type, period_end_date)
);

-- Create shareholding pattern table
CREATE TABLE public.stock_shareholding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
  quarter_end_date DATE NOT NULL,
  promoter_holding DECIMAL,
  fii_holding DECIMAL,
  dii_holding DECIMAL,
  government_holding DECIMAL,
  retail_holding DECIMAL,
  others_holding DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(stock_id, quarter_end_date)
);

-- Create peer comparison table (for caching)
CREATE TABLE public.stock_peers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
  peer_stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(stock_id, peer_stock_id)
);

-- Create indexes for performance
CREATE INDEX idx_stocks_symbol ON public.stocks(symbol);
CREATE INDEX idx_stocks_company_name ON public.stocks(company_name);
CREATE INDEX idx_stocks_sector ON public.stocks(sector);
CREATE INDEX idx_stocks_market_cap_category ON public.stocks(market_cap_category);
CREATE INDEX idx_stocks_change_percent ON public.stocks(change_percent DESC);
CREATE INDEX idx_stock_financials_stock_id ON public.stock_financials(stock_id);
CREATE INDEX idx_stock_shareholding_stock_id ON public.stock_shareholding(stock_id);

-- Enable Row Level Security
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_shareholding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_peers ENABLE ROW LEVEL SECURITY;

-- Create policies - stocks data is publicly readable (no auth needed for viewing market data)
CREATE POLICY "Stocks are publicly readable" 
ON public.stocks 
FOR SELECT 
USING (true);

CREATE POLICY "Stock financials are publicly readable" 
ON public.stock_financials 
FOR SELECT 
USING (true);

CREATE POLICY "Stock shareholding is publicly readable" 
ON public.stock_shareholding 
FOR SELECT 
USING (true);

CREATE POLICY "Stock peers are publicly readable" 
ON public.stock_peers 
FOR SELECT 
USING (true);

-- Service role can insert/update/delete (for edge functions)
CREATE POLICY "Service role can manage stocks" 
ON public.stocks 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage stock_financials" 
ON public.stock_financials 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage stock_shareholding" 
ON public.stock_shareholding 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage stock_peers" 
ON public.stock_peers 
FOR ALL 
USING (auth.role() = 'service_role');