import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Search, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockLogo } from "./StockLogo";
import { cn } from "@/lib/utils";

interface ScreenerFilters {
  marketCap?: string;
  sector?: string;
  minPE?: number;
  maxPE?: number;
  minROE?: number;
  minDividend?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const StockScreener = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>({
    sortBy: "market_cap",
    sortOrder: "desc",
  });

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["stock-screener", filters],
    queryFn: async () => {
      let query = supabase
        .from("stocks")
        .select("symbol, company_name, sector, market_cap_category, current_price, change_percent, pe_ratio, roe, dividend_yield, market_cap")
        .not("current_price", "is", null);

      if (filters.marketCap && filters.marketCap !== "all") {
        query = query.eq("market_cap_category", filters.marketCap);
      }

      if (filters.sector && filters.sector !== "all") {
        query = query.eq("sector", filters.sector);
      }

      if (filters.minPE !== undefined) {
        query = query.gte("pe_ratio", filters.minPE);
      }

      if (filters.maxPE !== undefined) {
        query = query.lte("pe_ratio", filters.maxPE);
      }

      if (filters.minROE !== undefined) {
        query = query.gte("roe", filters.minROE);
      }

      if (filters.minDividend !== undefined) {
        query = query.gte("dividend_yield", filters.minDividend);
      }

      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === "asc",
          nullsFirst: false,
        });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const sectors = [
    "all", "IT", "Banking", "FMCG", "Pharma", "Auto", "Oil & Gas", 
    "Metals", "Finance", "Infrastructure", "Power", "Telecom", "Chemicals"
  ];

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 100000) return `₹${(cap / 100000).toFixed(1)}L Cr`;
    if (cap >= 1000) return `₹${(cap / 1000).toFixed(1)}K Cr`;
    return `₹${cap.toFixed(0)} Cr`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Stock Screener
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.marketCap || "all"}
            onValueChange={(v) => setFilters({ ...filters, marketCap: v })}
          >
            <SelectTrigger className="w-[110px] sm:w-[130px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Market Cap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Caps</SelectItem>
              <SelectItem value="Large Cap">Large Cap</SelectItem>
              <SelectItem value="Mid Cap">Mid Cap</SelectItem>
              <SelectItem value="Small Cap">Small Cap</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sector || "all"}
            onValueChange={(v) => setFilters({ ...filters, sector: v })}
          >
            <SelectTrigger className="w-[110px] sm:w-[130px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector === "all" ? "All Sectors" : sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(v) => {
              const [sortBy, sortOrder] = v.split("-");
              setFilters({ ...filters, sortBy, sortOrder: sortOrder as "asc" | "desc" });
            }}
          >
            <SelectTrigger className="w-[120px] sm:w-[150px] h-8 sm:h-9 text-xs sm:text-sm">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap-desc">Market Cap ↓</SelectItem>
              <SelectItem value="market_cap-asc">Market Cap ↑</SelectItem>
              <SelectItem value="change_percent-desc">Change % ↓</SelectItem>
              <SelectItem value="change_percent-asc">Change % ↑</SelectItem>
              <SelectItem value="pe_ratio-asc">P/E Ratio ↑</SelectItem>
              <SelectItem value="roe-desc">ROE ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">P/E Ratio Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-8"
                  value={filters.minPE || ""}
                  onChange={(e) => setFilters({ ...filters, minPE: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-8"
                  value={filters.maxPE || ""}
                  onChange={(e) => setFilters({ ...filters, maxPE: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min ROE (%)</label>
              <Input
                type="number"
                placeholder="e.g., 15"
                className="h-8"
                value={filters.minROE || ""}
                onChange={(e) => setFilters({ ...filters, minROE: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min Dividend Yield (%)</label>
              <Input
                type="number"
                placeholder="e.g., 1"
                className="h-8"
                value={filters.minDividend || ""}
                onChange={(e) => setFilters({ ...filters, minDividend: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] sm:text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Stock</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">Change</th>
                <th className="text-right py-2 font-medium hidden md:table-cell">P/E</th>
                <th className="text-right py-2 font-medium hidden md:table-cell">ROE</th>
                <th className="text-right py-2 font-medium hidden lg:table-cell">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></td>
                    <td className="py-3"><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></td>
                    <td className="py-3"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : stocks && stocks.length > 0 ? (
                stocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <StockLogo symbol={stock.symbol} companyName={stock.company_name} size="sm" />
                        <div>
                          <div className="font-medium text-[13px]">{stock.symbol}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {stock.company_name}
                          </div>
                        </div>
                        {stock.market_cap_category && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {stock.market_cap_category.replace(" Cap", "")}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 font-medium">
                      {stock.current_price ? formatPrice(stock.current_price) : "—"}
                    </td>
                    <td className={cn(
                      "text-right py-3 font-medium",
                      (stock.change_percent || 0) >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {stock.change_percent !== null ? `${stock.change_percent >= 0 ? "+" : ""}${stock.change_percent.toFixed(2)}%` : "—"}
                    </td>
                    <td className="text-right py-3 hidden md:table-cell">
                      {stock.pe_ratio?.toFixed(1) || "—"}
                    </td>
                    <td className="text-right py-3 hidden md:table-cell">
                      {stock.roe ? `${stock.roe.toFixed(1)}%` : "—"}
                    </td>
                    <td className="text-right py-3 hidden lg:table-cell">
                      {stock.market_cap ? formatMarketCap(stock.market_cap) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No stocks match your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
