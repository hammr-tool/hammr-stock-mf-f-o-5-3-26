import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

export const ReturnsCalculator = () => {
  const [invested, setInvested] = useState(100000);
  const [currentValue, setCurrentValue] = useState(180000);
  const [years, setYears] = useState(5);

  const absoluteReturn = ((currentValue - invested) / invested) * 100;
  const cagr = ((currentValue / invested) ** (1 / years) - 1) * 100;
  const xirr = cagr; // Simplified

  // Compare with benchmarks
  const benchmarks = [
    { name: "Your Fund", cagr: cagr, color: "hsl(var(--primary))" },
    { name: "NIFTY 50", cagr: 12.5, color: "#3b82f6" },
    { name: "FD (Bank)", cagr: 7.0, color: "#f59e0b" },
    { name: "Gold", cagr: 10.2, color: "#eab308" },
    { name: "Inflation", cagr: 5.5, color: "#ef4444" },
  ];

  const comparisonData = benchmarks.map(b => ({
    name: b.name,
    CAGR: parseFloat(b.cagr.toFixed(2)),
    value: Math.round(invested * (1 + b.cagr / 100) ** years),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Investment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Amount Invested</Label>
                <span className="text-sm font-semibold text-primary">{formatCurrency(invested)}</span>
              </div>
              <Input type="number" value={invested} onChange={(e) => setInvested(Math.max(1000, parseInt(e.target.value) || 1000))} />
              <Slider value={[invested]} onValueChange={([v]) => setInvested(v)} min={1000} max={10000000} step={1000} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Current Value</Label>
                <span className="text-sm font-semibold text-primary">{formatCurrency(currentValue)}</span>
              </div>
              <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(Math.max(0, parseInt(e.target.value) || 0))} />
              <Slider value={[currentValue]} onValueChange={([v]) => setCurrentValue(v)} min={0} max={50000000} step={1000} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Holding Period (Years)</Label>
                <span className="text-sm font-semibold text-primary">{years} years</span>
              </div>
              <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={1} max={30} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Returns Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Absolute Return</p>
              <p className={`text-xl font-bold ${absoluteReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                {absoluteReturn.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">CAGR</p>
              <p className={`text-2xl font-bold ${cagr >= 0 ? "text-primary" : "text-destructive"}`}>
                {cagr.toFixed(2)}% p.a.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Profit / Loss</p>
              <p className={`text-xl font-bold ${currentValue >= invested ? "text-green-500" : "text-red-500"}`}>
                {currentValue >= invested ? "+" : ""}{formatCurrency(currentValue - invested)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(value: number, name: string) => name === "CAGR" ? `${value}%` : formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="CAGR" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CAGR %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
