import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockDetails {
  symbol: string;
  company_name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  market_cap_category?: string;
  current_price?: number;
  previous_close?: number;
  change_percent?: number;
  day_high?: number;
  day_low?: number;
  week_52_high?: number;
  week_52_low?: number;
  volume?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  eps?: number;
  book_value?: number;
  roe?: number;
  roce?: number;
  face_value?: number;
}

export interface StockFinancial {
  id: string;
  period_type: string;
  period_end_date: string;
  revenue?: number;
  net_profit?: number;
  operating_profit?: number;
  ebitda?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  total_debt?: number;
  cash_and_equivalents?: number;
}

export interface StockShareholding {
  id: string;
  quarter_end_date: string;
  promoter_holding?: number;
  fii_holding?: number;
  dii_holding?: number;
  government_holding?: number;
  retail_holding?: number;
  others_holding?: number;
}

export interface StockDetailsResponse {
  stock: StockDetails;
  financials: StockFinancial[];
  shareholding: StockShareholding[];
}

export const useStockDetails = (symbol: string) => {
  return useQuery({
    queryKey: ["stock-details", symbol],
    queryFn: async (): Promise<StockDetailsResponse> => {
      const { data, error } = await supabase.functions.invoke("fetch-stock-details", {
        body: { symbol },
      });

      if (error) {
        console.error("Stock details error:", error);
        throw error;
      }

      return data;
    },
    enabled: !!symbol,
    staleTime: 60000,
  });
};
