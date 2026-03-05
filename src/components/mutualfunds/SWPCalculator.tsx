import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatCurrency(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function calculateSWP(corpus: number, withdrawal: number, rate: number, years: number) {
  const months = years * 12;
  const r = rate / 100 / 12;
  let balance = corpus;
  const data = [{ month: 0, year: "Start", balance: corpus, withdrawn: 0 }];
  let totalWithdrawn = 0;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) - withdrawal;
    totalWithdrawn += withdrawal;
    if (balance < 0) balance = 0;
    if (m % 12 === 0 || m === months) {
      data.push({
        month: m,
        year: `Year ${Math.ceil(m / 12)}`,
        balance: Math.round(balance),
        withdrawn: Math.round(totalWithdrawn),
      });
    }
    if (balance <= 0) break;
  }

  return { finalBalance: Math.max(0, Math.round(balance)), totalWithdrawn: Math.round(totalWithdrawn), data };
}

export const SWPCalculator = () => {
  const [corpus, setCorpus] = useState(5000000);
  const [withdrawal, setWithdrawal] = useState(30000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);

  const result = calculateSWP(corpus, withdrawal, rate, years);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              SWP Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Total Investment</Label>
                <span className="text-sm font-semibold text-primary">{formatCurrency(corpus)}</span>
              </div>
              <Input type="number" value={corpus} onChange={(e) => setCorpus(Math.max(100000, parseInt(e.target.value) || 100000))} />
              <Slider value={[corpus]} onValueChange={([v]) => setCorpus(v)} min={100000} max={100000000} step={100000} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Monthly Withdrawal</Label>
                <span className="text-sm font-semibold text-primary">{formatCurrency(withdrawal)}</span>
              </div>
              <Input type="number" value={withdrawal} onChange={(e) => setWithdrawal(Math.max(1000, parseInt(e.target.value) || 1000))} />
              <Slider value={[withdrawal]} onValueChange={([v]) => setWithdrawal(v)} min={1000} max={500000} step={1000} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Expected Return Rate (% p.a.)</Label>
                <span className="text-sm font-semibold text-primary">{rate}%</span>
              </div>
              <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={1} max={20} step={0.5} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Withdrawal Period (Years)</Label>
                <span className="text-sm font-semibold text-primary">{years} years</span>
              </div>
              <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={1} max={40} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SWP Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-xl font-bold">{formatCurrency(corpus)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              <p className="text-xl font-bold text-orange-500">{formatCurrency(result.totalWithdrawn)}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Remaining Balance</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(result.finalBalance)}</p>
            </div>
            {result.finalBalance === 0 && (
              <p className="text-sm text-destructive font-medium">⚠️ Corpus depleted before the end of the withdrawal period.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
