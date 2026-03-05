import { useState } from "react";
import { useMutualFunds } from "@/hooks/useMutualFundData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Search, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MutualFund } from "@/types/mutualFund";

function formatAUM(aum: number) {
  if (aum >= 10000) return `₹${(aum / 10000).toFixed(0)}K Cr`;
  if (aum >= 1000) return `₹${(aum / 1000).toFixed(1)}K Cr`;
  return `₹${aum.toFixed(0)} Cr`;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// Category definitions for browsing
const CATEGORIES = [
  { key: "small", label: "Small Cap", search: "Small Cap", icon: "🚀", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { key: "mid", label: "Mid Cap", search: "Mid Cap", icon: "📈", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { key: "large", label: "Large Cap", search: "Large Cap", icon: "🏢", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { key: "flexi", label: "Flexi Cap", search: "Flexi Cap", icon: "🔄", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { key: "elss", label: "ELSS (Tax Saver)", search: "ELSS", icon: "🛡️", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { key: "gold", label: "Gold & Silver", search: "Gold", icon: "🥇", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  { key: "debt", label: "Debt Funds", search: "Debt", icon: "🏦", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  { key: "index", label: "Index Funds", search: "Index", icon: "📊", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
];

function FundCard({ fund, onClick }: { fund: MutualFund; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onClick}>
      <CardContent className="py-3 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-snug line-clamp-2">{fund.schemeName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground truncate">{fund.fundHouse}</span>
              <RatingStars rating={fund.rating} />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">NAV</p>
              <p className="font-semibold">₹{fund.nav.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">1Y Return</p>
              <p className={`font-semibold flex items-center justify-end gap-0.5 ${fund.return1Y >= 0 ? "text-green-500" : "text-red-500"}`}>
                {fund.return1Y >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(fund.return1Y)}%
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">3Y Return</p>
              <p className={`font-semibold ${fund.return3Y >= 0 ? "text-green-500" : "text-red-500"}`}>
                {fund.return3Y >= 0 ? "+" : ""}{fund.return3Y}%
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-muted-foreground">AUM</p>
              <p className="font-semibold">{formatAUM(fund.aum)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Category section that fetches its own data
function CategorySection({ cat, onViewAll }: { cat: typeof CATEGORIES[0]; onViewAll: (category: string) => void }) {
  const navigate = useNavigate();
  const { data, isLoading } = useMutualFunds({ category: cat.search, limit: 5 });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.icon}</span>
          <h3 className="font-semibold text-base">{cat.label}</h3>
          {data && <Badge variant="outline" className="text-xs">{data.total} funds</Badge>}
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => onViewAll(cat.search)}>
          View All <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {data?.funds.slice(0, 4).map((fund) => (
            <FundCard key={fund.schemeCode} fund={fund} onClick={() => navigate(`/mutual-funds/fund/${fund.schemeCode}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

// Top performers section with return period filter
function TopPerformers() {
  const navigate = useNavigate();
  const [returnPeriod, setReturnPeriod] = useState<"1Y" | "3Y" | "5Y">("1Y");
  const { data, isLoading } = useMutualFunds({ limit: 50 });

  const sortedFunds = data?.funds
    ? [...data.funds].sort((a, b) => {
        if (returnPeriod === "1Y") return b.return1Y - a.return1Y;
        if (returnPeriod === "3Y") return b.return3Y - a.return3Y;
        return b.return5Y - a.return5Y;
      }).slice(0, 10)
    : [];

  const getReturnValue = (fund: MutualFund) => {
    if (returnPeriod === "1Y") return fund.return1Y;
    if (returnPeriod === "3Y") return fund.return3Y;
    return fund.return5Y;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Performing Funds
          </CardTitle>
          <ToggleGroup type="single" value={returnPeriod} onValueChange={(v) => v && setReturnPeriod(v as "1Y" | "3Y" | "5Y")} size="sm">
            <ToggleGroupItem value="1Y" className="text-xs px-3">1 Year</ToggleGroupItem>
            <ToggleGroupItem value="3Y" className="text-xs px-3">3 Years</ToggleGroupItem>
            <ToggleGroupItem value="5Y" className="text-xs px-3">5 Years</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedFunds.map((fund, idx) => {
              const returnVal = getReturnValue(fund);
              return (
                <div
                  key={fund.schemeCode}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/mutual-funds/fund/${fund.schemeCode}`)}
                >
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug line-clamp-1">{fund.schemeName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{fund.fundHouse}</span>
                      <RatingStars rating={fund.rating} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm flex items-center gap-0.5 ${returnVal >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {returnVal >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {Math.abs(returnVal)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{returnPeriod} return</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const MFExplorer = ({ slotAfterSearch }: { slotAfterSearch?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);

  // Search results mode
  const isSearching = search.length > 0 || activeCategory.length > 0;

  const { data, isLoading } = useMutualFunds({
    search: search || undefined,
    category: activeCategory || undefined,
    page,
    limit: 30,
  });

  const handleViewAll = (categorySearch: string) => {
    setActiveCategory(categorySearch);
    setSearch("");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by fund name, AMC, or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(""); setPage(1); }}
              className="pl-10"
            />
          </div>
          {isSearching && (
            <div className="flex items-center gap-2 mt-3">
              {activeCategory && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" /> {activeCategory}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {slotAfterSearch}

      {isSearching ? (
        /* Search / Category Results */
        <div className="space-y-3">
          {data && (
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 30) + 1}-{Math.min(page * 30, data.total)} of {data.total.toLocaleString()} funds
            </p>
          )}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-1.5">
              {data?.funds.map((fund) => (
                <FundCard key={fund.schemeCode} fund={fund} onClick={() => navigate(`/mutual-funds/fund/${fund.schemeCode}`)} />
              ))}
            </div>
          )}
          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Default: Category Browse + Top Performers */
        <>
          {/* Category Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleViewAll(cat.search)}
                  className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 p-2 sm:p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md ${cat.color}`}
                >
                  <span className="text-lg sm:text-2xl">{cat.icon}</span>
                  <span className="font-medium text-[10px] sm:text-sm leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category-wise Listings */}
          <div className="space-y-8">
            {CATEGORIES.slice(0, 4).map((cat) => (
              <CategorySection key={cat.key} cat={cat} onViewAll={handleViewAll} />
            ))}
          </div>

          {/* Top Performers */}
          <TopPerformers />
        </>
      )}
    </div>
  );
};
