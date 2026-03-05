import { useState } from "react";
import { useMutualFunds } from "@/hooks/useMutualFundData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, X, Plus, Scale, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MutualFund } from "@/types/mutualFund";

function formatCurrency(val: number) {
  if (val >= 10000) return `₹${(val / 10000).toFixed(0)}K Cr`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`;
  return `₹${val.toFixed(0)} Cr`;
}

const COLORS = ["hsl(var(--primary))", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

export const FundComparison = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFunds, setSelectedFunds] = useState<MutualFund[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const { data, isLoading } = useMutualFunds({
    search: searchQuery || undefined,
    limit: 10,
  });

  const addFund = (fund: MutualFund) => {
    if (selectedFunds.length >= 5) return;
    if (selectedFunds.some(f => f.schemeCode === fund.schemeCode)) return;
    setSelectedFunds([...selectedFunds, fund]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeFund = (code: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.schemeCode !== code));
  };

  // Create short readable labels for chart
  const getFundLabel = (fund: MutualFund) => {
    // Extract a meaningful short name from the scheme name
    const name = fund.schemeName
      .replace(/\s*-\s*(Direct|Regular)\s*(Plan|Growth|Dividend|IDCW)?.*/i, '')
      .replace(/Mutual Fund/i, '')
      .trim();
    return name.length > 25 ? name.slice(0, 25) + '…' : name;
  };

  const chartData = selectedFunds.length > 0
    ? [
        { metric: "1Y Return (%)", ...Object.fromEntries(selectedFunds.map((f) => [getFundLabel(f), f.return1Y])) },
        { metric: "3Y Return (%)", ...Object.fromEntries(selectedFunds.map((f) => [getFundLabel(f), f.return3Y])) },
        { metric: "5Y Return (%)", ...Object.fromEntries(selectedFunds.map((f) => [getFundLabel(f), f.return5Y])) },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Add fund */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" />
            Compare Mutual Funds (up to 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedFunds.map((f) => (
              <Badge key={f.schemeCode} variant="secondary" className="gap-1 py-1">
                {f.schemeName.slice(0, 30)}...
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFund(f.schemeCode)} />
              </Badge>
            ))}
            {selectedFunds.length < 5 && (
              <Button variant="outline" size="sm" onClick={() => setShowSearch(true)} className="gap-1">
                <Plus className="h-3 w-3" /> Add Fund
              </Button>
            )}
          </div>

          {showSearch && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mutual fund..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              {isLoading && <Skeleton className="h-20 w-full" />}
              {searchQuery && data?.funds && (
                <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
                  {data.funds.map((fund) => (
                    <button
                      key={fund.schemeCode}
                      onClick={() => addFund(fund)}
                      disabled={selectedFunds.some(f => f.schemeCode === fund.schemeCode)}
                      className="w-full text-left p-2 rounded hover:bg-accent text-sm disabled:opacity-50"
                    >
                      <p className="font-medium truncate">{fund.schemeName}</p>
                      <p className="text-xs text-muted-foreground">{fund.fundHouse} · NAV: ₹{fund.nav.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFunds.length >= 2 && (
        <>
          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Returns Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    {selectedFunds.map((f, i) => (
                      <Bar key={f.schemeCode} dataKey={getFundLabel(f)} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    {selectedFunds.map(f => (
                      <TableHead key={f.schemeCode} className="min-w-[150px]">{f.schemeName.slice(0, 40)}...</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">NAV</TableCell>
                    {selectedFunds.map(f => <TableCell key={f.schemeCode}>₹{f.nav.toFixed(2)}</TableCell>)}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">1Y Return</TableCell>
                    {selectedFunds.map(f => (
                      <TableCell key={f.schemeCode} className={f.return1Y >= 0 ? "text-green-500" : "text-red-500"}>
                        {f.return1Y}%
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">3Y Return</TableCell>
                    {selectedFunds.map(f => (
                      <TableCell key={f.schemeCode} className={f.return3Y >= 0 ? "text-green-500" : "text-red-500"}>
                        {f.return3Y}%
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">5Y Return</TableCell>
                    {selectedFunds.map(f => (
                      <TableCell key={f.schemeCode} className={f.return5Y >= 0 ? "text-green-500" : "text-red-500"}>
                        {f.return5Y}%
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">AUM</TableCell>
                    {selectedFunds.map(f => <TableCell key={f.schemeCode}>{formatCurrency(f.aum)}</TableCell>)}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Expense Ratio</TableCell>
                    {selectedFunds.map(f => <TableCell key={f.schemeCode}>{f.expenseRatio}%</TableCell>)}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Rating</TableCell>
                    {selectedFunds.map(f => (
                      <TableCell key={f.schemeCode}>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= f.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Category</TableCell>
                    {selectedFunds.map(f => <TableCell key={f.schemeCode} className="text-xs">{f.schemeCategory}</TableCell>)}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {selectedFunds.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Add at least 2 funds to start comparing</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
