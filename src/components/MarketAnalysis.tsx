import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const analyses = [
  {
    title: "Market Outlook - Bullish Momentum Continues",
    time: "2 hours ago",
    summary: "NIFTY shows strong bullish momentum with resistance at 20,100. Bank Nifty consolidating near highs.",
    sentiment: "Bullish",
    tags: ["NIFTY", "Bank Nifty", "Trend Analysis"]
  },
  {
    title: "Option Strategy: Bull Call Spread",
    time: "4 hours ago",
    summary: "With IV at 18%, consider 20000-20200 bull call spread for moderate upside with limited risk.",
    sentiment: "Neutral",
    tags: ["Strategy", "Options", "Risk Management"]
  },
  {
    title: "FII Activity Shows Strong Buying",
    time: "6 hours ago",
    summary: "FIIs bought ₹2,456 Cr in index futures, indicating positive institutional sentiment.",
    sentiment: "Bullish",
    tags: ["FII/DII", "Institutional", "Market Flow"]
  },
  {
    title: "Put-Call Ratio Analysis",
    time: "8 hours ago",
    summary: "PCR at 1.15 suggests moderate bullish sentiment. Watch for changes near key strikes.",
    sentiment: "Neutral",
    tags: ["PCR", "Options", "Market Sentiment"]
  },
];

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "Bullish": return "text-green-600 bg-green-100 dark:bg-green-900/20";
    case "Bearish": return "text-red-600 bg-red-100 dark:bg-red-900/20";
    case "Neutral": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  }
};

export const MarketAnalysis = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Market Analysis</h2>
      </div>
      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg">{analysis.title}</h3>
              <Badge className={getSentimentColor(analysis.sentiment)} variant="secondary">
                {analysis.sentiment}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.summary}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {analysis.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{analysis.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
