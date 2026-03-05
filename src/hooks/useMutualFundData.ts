import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MutualFundResponse, MutualFundDetail } from "@/types/mutualFund";

interface FetchParams {
  search?: string;
  category?: string;
  fundHouse?: string;
  page?: number;
  limit?: number;
}

export function useMutualFunds(params: FetchParams = {}) {
  return useQuery<MutualFundResponse>({
    queryKey: ["mutual-funds", params],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-mutual-fund-data", {
        body: { action: "list", ...params },
      });
      if (error) throw error;
      return data as MutualFundResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function useMutualFundDetail(schemeCode: string | undefined) {
  return useQuery<{ fund: MutualFundDetail }>({
    queryKey: ["mutual-fund-detail", schemeCode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-mutual-fund-data", {
        body: { action: "detail", schemeCode },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!schemeCode,
    staleTime: 5 * 60 * 1000,
  });
}
