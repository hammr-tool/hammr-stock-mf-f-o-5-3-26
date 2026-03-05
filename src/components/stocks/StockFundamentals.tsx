import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockDetails } from "@/hooks/useStockDetails";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockFundamentalsProps {
  stock: StockDetails;
}

export const StockFundamentals = ({ stock }: StockFundamentalsProps) => {
  const formatPrice = (price?: number) => {
    if (!price) return "—";
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value?: number) => {
    if (!value) return "—";
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value?: number, decimals = 2) => {
    if (!value) return "—";
    return value.toFixed(decimals);
  };

  const formatMarketCap = (cap?: number) => {
    if (!cap) return "—";
    if (cap >= 100000) return `₹${(cap / 100000).toFixed(2)} Lakh Cr`;
    if (cap >= 1000) return `₹${(cap / 1000).toFixed(2)}K Cr`;
    return `₹${cap.toFixed(0)} Cr`;
  };

  const StatRow = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string;
    highlight?: "positive" | "negative" | "neutral";
  }) => (
    <div className="flex justify-between py-1.5 border-b last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium text-xs",
          highlight === "positive" && "text-green-500",
          highlight === "negative" && "text-red-500"
        )}
      >
        {value}
      </span>
    </div>
  );

  // Calculate pros and cons based on ratios
  const pros: string[] = [];
  const cons: string[] = [];

  if (stock.pe_ratio && stock.pe_ratio < 20) {
    pros.push("Low P/E ratio indicates undervaluation");
  } else if (stock.pe_ratio && stock.pe_ratio > 40) {
    cons.push("High P/E ratio - stock may be overvalued");
  }

  if (stock.roe && stock.roe > 15) {
    pros.push(`Strong ROE of ${stock.roe.toFixed(1)}%`);
  } else if (stock.roe && stock.roe < 10) {
    cons.push("Low return on equity");
  }

  if (stock.roce && stock.roce > 15) {
    pros.push(`Good ROCE of ${stock.roce.toFixed(1)}%`);
  }

  if (stock.dividend_yield && stock.dividend_yield > 2) {
    pros.push(`Attractive dividend yield of ${stock.dividend_yield.toFixed(2)}%`);
  }

  if (stock.pb_ratio && stock.pb_ratio < 1) {
    pros.push("Trading below book value");
  } else if (stock.pb_ratio && stock.pb_ratio > 5) {
    cons.push("High price-to-book ratio");
  }

  if (stock.week_52_low && stock.current_price) {
    const nearLow = (stock.current_price / stock.week_52_low - 1) < 0.1;
    if (nearLow) {
      cons.push("Near 52-week low");
    }
  }

  if (stock.week_52_high && stock.current_price) {
    const nearHigh = (stock.week_52_high / stock.current_price - 1) < 0.1;
    if (nearHigh) {
      pros.push("Near 52-week high - showing strength");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Key Ratios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Key Ratios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <StatRow label="P/E Ratio" value={formatNumber(stock.pe_ratio)} />
          <StatRow label="P/B Ratio" value={formatNumber(stock.pb_ratio)} />
          <StatRow label="ROE" value={formatPercent(stock.roe)} />
          <StatRow label="ROCE" value={formatPercent(stock.roce)} />
          <StatRow label="EPS" value={formatPrice(stock.eps)} />
          <StatRow label="Book Value" value={formatPrice(stock.book_value)} />
          <StatRow label="Dividend Yield" value={formatPercent(stock.dividend_yield)} />
          <StatRow label="Face Value" value={formatPrice(stock.face_value)} />
        </CardContent>
      </Card>

      {/* Price & Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price & Volume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <StatRow label="Current Price" value={formatPrice(stock.current_price)} />
          <StatRow label="Previous Close" value={formatPrice(stock.previous_close)} />
          <StatRow label="Day High" value={formatPrice(stock.day_high)} />
          <StatRow label="Day Low" value={formatPrice(stock.day_low)} />
          <StatRow label="52 Week High" value={formatPrice(stock.week_52_high)} />
          <StatRow label="52 Week Low" value={formatPrice(stock.week_52_low)} />
          <StatRow
            label="Volume"
            value={stock.volume ? stock.volume.toLocaleString("en-IN") : "—"}
          />
          <StatRow label="Market Cap" value={formatMarketCap(stock.market_cap)} />
        </CardContent>
      </Card>

      {/* Pros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            Pros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pros.length > 0 ? (
            <ul className="space-y-2">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-xs">{pro}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Insufficient data to determine pros
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            Cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cons.length > 0 ? (
            <ul className="space-y-2">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-xs">{con}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No significant concerns identified
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
