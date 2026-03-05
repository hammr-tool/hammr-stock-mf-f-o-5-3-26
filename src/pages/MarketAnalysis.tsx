import { useState } from "react";
import { Header } from "@/components/Header";
import { useMarketAnalysis } from "@/hooks/useMarketAnalysis";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Filter, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { BottomTabBar } from "@/components/BottomTabBar";

const MarketAnalysis = () => {
  const { data, isLoading, error, refetch } = useMarketAnalysis();
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish":
        return <TrendingUp className="h-4 w-4" />;
      case "Bearish":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Bearish":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    }
  };

  const filterAndSortAnalyses = () => {
    if (!data?.analyses) return [];

    let filtered = [...data.analyses];

    // Filter by sentiment
    if (sentimentFilter !== "all") {
      filtered = filtered.filter(item => item.sentiment === sentimentFilter);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Sort
    if (sortOrder === "latest") {
      filtered.sort((a, b) => a.priority - b.priority);
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => b.priority - a.priority);
    }

    return filtered;
  };

  const analyses = filterAndSortAnalyses();
  const categories = data?.analyses 
    ? Array.from(new Set(data.analyses.map(item => item.category)))
    : [];

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load market analysis. {" "}
              <Button variant="link" onClick={() => refetch()} className="p-0 h-auto">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </main>
         <BottomTabBar />
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="Bullish">Bullish</SelectItem>
              <SelectItem value="Bearish">Bearish</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {(sentimentFilter !== "all" || categoryFilter !== "all") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSentimentFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}

          {data?.analyses && (
            <span className="text-sm text-muted-foreground ml-auto">
              {analyses.length} of {data.analyses.length} news
            </span>
          )}
        </div>

        {/* News List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-8 text-center border rounded-lg">
            <p className="text-muted-foreground">No analyses found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                  <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 p-4">
                      <Badge 
                        variant="outline" 
                        className={`${getSentimentColor(item.sentiment)} flex items-center gap-1 shrink-0`}
                      >
                        {getSentimentIcon(item.sentiment)}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm md:text-base">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-0 border-t">
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {(item as any).url && (
                            <a 
                              href={(item as any).url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-auto"
                            >
                              <Button variant="outline" size="sm" className="text-xs gap-1">
                                Read More <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </main>
       <BottomTabBar />
    </div>
  );
};

export default MarketAnalysis;