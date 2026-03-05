import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StockPeersProps {
  sector?: string;
  currentSymbol: string;
}

export const StockPeers = ({ sector, currentSymbol }: StockPeersProps) => {
  const navigate = useNavigate();

  const { data: peers, isLoading } = useQuery({
    queryKey: ["stock-peers", sector, currentSymbol],
    queryFn: async () => {
      if (!sector) return [];

      const { data, error } = await supabase
        .from("stocks")
        .select(
          "symbol, company_name, current_price, change_percent, pe_ratio, roe, market_cap, market_cap_category"
        )
        .eq("sector", sector)
        .neq("symbol", currentSymbol)
        .not("current_price", "is", null)
        .order("market_cap", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!sector,
    staleTime: 60000,
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 100000) return `₹${(cap / 100000).toFixed(1)}L Cr`;
    if (cap >= 1000) return `₹${(cap / 1000).toFixed(1)}K Cr`;
    return `₹${cap.toFixed(0)} Cr`;
  };

  if (!sector) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peer Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Sector information not available
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peer Comparison - {sector}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!peers || peers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peer Comparison - {sector}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No peer companies found in {sector} sector
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Peer Comparison - {sector}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Company</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">Change</th>
                <th className="text-right py-2 font-medium hidden md:table-cell">P/E</th>
                <th className="text-right py-2 font-medium hidden md:table-cell">ROE</th>
                <th className="text-right py-2 font-medium hidden lg:table-cell">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {peers.map((peer) => (
                <tr
                  key={peer.symbol}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/stocks/${peer.symbol}`)}
                >
                  <td className="py-3">
                    <div>
                      <div className="font-medium">{peer.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {peer.company_name}
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 font-medium">
                    {peer.current_price ? formatPrice(peer.current_price) : "—"}
                  </td>
                  <td
                    className={cn(
                      "text-right py-3 font-medium",
                      (peer.change_percent || 0) >= 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {peer.change_percent !== null
                      ? `${peer.change_percent >= 0 ? "+" : ""}${peer.change_percent.toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="text-right py-3 hidden md:table-cell">
                    {peer.pe_ratio?.toFixed(1) || "—"}
                  </td>
                  <td className="text-right py-3 hidden md:table-cell">
                    {peer.roe ? `${peer.roe.toFixed(1)}%` : "—"}
                  </td>
                  <td className="text-right py-3 hidden lg:table-cell">
                    {peer.market_cap ? formatMarketCap(peer.market_cap) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
