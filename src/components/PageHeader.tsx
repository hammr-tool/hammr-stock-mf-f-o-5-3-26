import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { INDICES, IndexConfig } from "@/config/indices";
import { useMemo } from "react";

// Check if Indian market is open (9:15 AM - 3:30 PM IST, Mon-Fri)
const checkMarketOpen = (): boolean => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
  
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market closed on weekends (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) return false;
  
  // Market hours: 9:15 AM (555 mins) to 3:30 PM (930 mins) IST
  const marketOpen = 9 * 60 + 15; // 9:15 AM = 555 minutes
  const marketClose = 15 * 60 + 30; // 3:30 PM = 930 minutes
  
  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
};

interface PageHeaderProps {
  selectedIndex: IndexConfig;
  onIndexChange: (symbol: string) => void;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  atmStrike?: number;
  timestamp?: string;
  isLoading?: boolean;
  isMarketOpen?: boolean;
}

export const PageHeader = ({
  selectedIndex,
  onIndexChange,
  currentPrice,
  change,
  changePercent,
  atmStrike,
  timestamp,
  isLoading,
  isMarketOpen: externalMarketOpen
}: PageHeaderProps) => {
  // Use external value if provided, otherwise calculate based on IST
  const isMarketOpen = useMemo(() => {
    return externalMarketOpen !== undefined ? externalMarketOpen : checkMarketOpen();
  }, [externalMarketOpen]);

  return (
    <div className="bg-card border rounded-lg p-3 md:p-6 space-y-2 md:space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Select value={selectedIndex.symbol} onValueChange={onIndexChange}>
              <SelectTrigger className="w-[130px] md:w-[200px] text-xs md:text-sm h-8 md:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDICES.map((index) => (
                  <SelectItem key={index.symbol} value={index.symbol} className="text-xs md:text-sm">
                    {index.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ATM Strike - shown on right side of select on mobile */}
          {atmStrike !== undefined && (
            <div className="md:hidden text-right">
              <div className="text-[9px] text-muted-foreground">ATM Strike</div>
              <div className="text-sm font-bold text-primary">
                {atmStrike.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isMarketOpen ? (
            <>
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-medium text-green-600">Live</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-gray-400"></span>
              </span>
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground">Market Closed</span>
            </>
          )}
        </div>
      </div>

      {currentPrice !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <div>
            <div className="text-[10px] md:text-sm text-muted-foreground mb-0.5 md:mb-1">Current Price</div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="text-base md:text-2xl font-bold">
                {currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {change !== undefined && changePercent !== undefined && (
                <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? <ArrowUp className="h-3 w-3 md:h-4 md:w-4" /> : <ArrowDown className="h-3 w-3 md:h-4 md:w-4" />}
                  {Math.abs(change).toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>

          {/* ATM Strike - shown in grid on desktop only */}
          {atmStrike !== undefined && (
            <div className="hidden md:block">
              <div className="text-[10px] md:text-sm text-muted-foreground mb-0.5 md:mb-1">ATM Strike</div>
              <div className="text-base md:text-2xl font-bold text-primary">
                {atmStrike.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
