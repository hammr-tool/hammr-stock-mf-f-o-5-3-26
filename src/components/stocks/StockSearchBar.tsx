import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStockSearch, StockSearchResult } from "@/hooks/useStockSearch";
import { cn } from "@/lib/utils";

interface StockSearchBarProps {
  onSelect?: (stock: StockSearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const StockSearchBar = ({
  onSelect,
  placeholder = "Search for any stock... (e.g., RELIANCE, TCS, INFY)",
  className,
  autoFocus = false,
}: StockSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: results, isLoading } = useStockSearch(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (stock: StockSearchResult) => {
    setQuery("");
    setIsOpen(false);
    if (onSelect) {
      onSelect(stock);
    } else {
      navigate(`/stocks/${stock.symbol}`);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "—";
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number | null) => {
    if (change === null) return "—";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11 text-sm bg-background border-2 focus:border-primary"
          autoFocus={autoFocus}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 1 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          ) : results && results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((stock) => (
                <li key={stock.id}>
                  <button
                    onClick={() => handleSelect(stock)}
                    className="w-full px-3 py-2.5 text-left hover:bg-accent/50 transition-colors flex items-center justify-between gap-3 border-b last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-foreground">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {stock.exchange}
                        </span>
                        {stock.market_cap_category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {stock.market_cap_category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {stock.company_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-[13px]">
                        {formatPrice(stock.current_price)}
                      </div>
                      {stock.change_percent !== null && (
                        <div
                          className={cn(
                            "text-xs flex items-center justify-end gap-1",
                            stock.change_percent >= 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {stock.change_percent >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatChange(stock.change_percent)}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No stocks found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
