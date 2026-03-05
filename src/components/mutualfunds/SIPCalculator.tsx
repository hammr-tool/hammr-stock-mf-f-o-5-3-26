import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, TrendingUp, IndianRupee } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function calculateSIP(monthly: number, rate: number, years: number) {
  const months = years * 12;
  const r = rate / 100 / 12;
  if (r === 0) return { total: monthly * months, invested: monthly * months, returns: 0 };
  const fv = monthly * (((1 + r) ** months - 1) / r) * (1 + r);
  const invested = monthly * months;
  return { total: Math.round(fv), invested, returns: Math.round(fv - invested) };
}

function calculateLumpsum(principal: number, rate: number, years: number) {
  const fv = principal * (1 + rate / 100) ** years;
  return { total: Math.round(fv), invested: principal, returns: Math.round(fv - principal) };
}

function generateChartData(monthly: number, rate: number, years: number, type: "sip" | "lumpsum") {
  const data = [];
  for (let y = 0; y <= years; y++) {
    if (type === "sip") {
      const { total, invested } = calculateSIP(monthly, rate, y);
      data.push({ year: `Year ${y}`, invested, total, returns: total - invested });
    } else {
      const { total, invested } = calculateLumpsum(monthly, rate, y);
      data.push({ year: `Year ${y}`, invested, total, returns: total - invested });
    }
  }
  return data;
}

export const SIPCalculator = () => {
  const [mode, setMode] = useState<"sip" | "lumpsum">("sip");
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = mode === "sip"
    ? calculateSIP(monthly, rate, years)
    : calculateLumpsum(monthly, rate, years);

  const chartData = generateChartData(monthly, rate, years, mode);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "sip" | "lumpsum")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
          <TabsTrigger value="lumpsum">Lumpsum Calculator</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              {mode === "sip" ? "SIP" : "Lumpsum"} Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{mode === "sip" ? "Monthly Investment" : "Investment Amount"}</Label>
                <span className="text-sm font-semibold text-primary">{formatCurrency(monthly)}</span>
              </div>
              <Input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(Math.max(500, parseInt(e.target.value) || 500))}
                min={500}
              />
              <Slider
                value={[monthly]}
                onValueChange={([v]) => setMonthly(v)}
                min={500}
                max={mode === "sip" ? 200000 : 10000000}
                step={mode === "sip" ? 500 : 10000}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Expected Return Rate (% p.a.)</Label>
                <span className="text-sm font-semibold text-primary">{rate}%</span>
              </div>
              <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={1} max={30} step={0.5} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Time Period (Years)</Label>
                <span className="text-sm font-semibold text-primary">{years} years</span>
              </div>
              <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={1} max={40} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Returns Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">Invested Amount</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(result.invested)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">Est. Returns</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(result.returns)}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(result.total)}</p>
              </div>
            </div>

            {/* Donut-style breakdown */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground">Invested ({((result.invested / result.total) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Returns ({((result.returns / result.total) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="invested" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" name="Invested" />
                <Area type="monotone" dataKey="returns" stackId="1" stroke="#22c55e" fill="#22c55e40" name="Returns" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
