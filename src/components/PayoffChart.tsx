import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface StrategyLeg {
  action: "Buy" | "Sell";
  type: "Call" | "Put";
  strike: number;
  premium: number;
}

interface PayoffChartProps {
  stockPrice: number;
  legs: StrategyLeg[];
  lotSize?: number;
}

export const PayoffChart = ({ stockPrice, legs, lotSize = 1 }: PayoffChartProps) => {
  const chartData = useMemo(() => {
    // Calculate the range for the chart
    const strikes = legs.map((leg) => leg.strike);
    const minStrike = Math.min(...strikes);
    const maxStrike = Math.max(...strikes);
    const range = maxStrike - minStrike || stockPrice * 0.1;
    const padding = Math.max(range * 1.5, stockPrice * 0.08);

    const startPrice = Math.floor((minStrike - padding) / 100) * 100;
    const endPrice = Math.ceil((maxStrike + padding) / 100) * 100;
    const step = Math.max(Math.round((endPrice - startPrice) / 50), 10);

    const data = [];

    for (let price = startPrice; price <= endPrice; price += step) {
      let payoff = 0;

      // Calculate payoff for each leg
      legs.forEach((leg) => {
        const { action, type, strike, premium } = leg;
        const multiplier = action === "Buy" ? 1 : -1;

        if (type === "Call") {
          // Call option payoff
          const intrinsicValue = Math.max(0, price - strike);
          payoff += multiplier * (intrinsicValue - premium);
        } else {
          // Put option payoff
          const intrinsicValue = Math.max(0, strike - price);
          payoff += multiplier * (intrinsicValue - premium);
        }
      });

      data.push({
        price,
        payoff: payoff * lotSize,
        zero: 0,
      });
    }

    return data;
  }, [stockPrice, legs, lotSize]);

  // Find breakeven points and max profit/loss
  const { maxProfit, maxLoss, breakevenPoints } = useMemo(() => {
    let max = -Infinity;
    let min = Infinity;
    const breakevens: number[] = [];

    for (let i = 0; i < chartData.length; i++) {
      const { payoff, price } = chartData[i];
      if (payoff > max) max = payoff;
      if (payoff < min) min = payoff;

      // Check for zero crossings (breakeven)
      if (i > 0) {
        const prevPayoff = chartData[i - 1].payoff;
        if ((prevPayoff < 0 && payoff >= 0) || (prevPayoff >= 0 && payoff < 0)) {
          // Linear interpolation to find exact breakeven
          const prevPrice = chartData[i - 1].price;
          const exactBreakeven =
            prevPrice + ((price - prevPrice) * (0 - prevPayoff)) / (payoff - prevPayoff);
          breakevens.push(Math.round(exactBreakeven));
        }
      }
    }

    return {
      maxProfit: max,
      maxLoss: min,
      breakevenPoints: breakevens,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const payoff = payload[0].value;
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs text-muted-foreground">Price: ₹{label}</p>
          <p className={`text-sm font-bold ${payoff >= 0 ? "text-success" : "text-destructive"}`}>
            P&L: ₹{payoff.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey="price"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => `₹${value}`}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Zero line */}
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            
            {/* Current stock price line */}
            <ReferenceLine
              x={stockPrice}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: "Current",
                position: "top",
                fill: "hsl(var(--primary))",
                fontSize: 10,
              }}
            />

            {/* Strike price lines */}
            {legs.map((leg, idx) => (
              <ReferenceLine
                key={idx}
                x={leg.strike}
                stroke={leg.action === "Buy" ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            ))}

            {/* Profit area */}
            <Area
              type="monotone"
              dataKey="payoff"
              stroke="none"
              fill="url(#profitGradient)"
              fillOpacity={1}
              isAnimationActive={false}
              baseValue={0}
            />

            {/* Main payoff line */}
            <Area
              type="monotone"
              dataKey="payoff"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="none"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-success/10 rounded-lg p-2 border border-success/30">
          <p className="text-[10px] text-muted-foreground">Max Profit</p>
          <p className="text-xs font-bold text-success">
            {maxProfit === Infinity ? "Unlimited" : `₹${maxProfit.toFixed(0)}`}
          </p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/30">
          <p className="text-[10px] text-muted-foreground">Max Loss</p>
          <p className="text-xs font-bold text-destructive">
            {maxLoss === -Infinity ? "Unlimited" : `₹${Math.abs(maxLoss).toFixed(0)}`}
          </p>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 border border-primary/30">
          <p className="text-[10px] text-muted-foreground">Breakeven</p>
          <p className="text-xs font-bold text-primary">
            {breakevenPoints.length > 0
              ? breakevenPoints.map((b) => `₹${b}`).join(", ")
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-primary" />
          <span>P&L Line</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-primary border-dashed border-t-2 border-primary" style={{ borderStyle: 'dashed' }} />
          <span>Current Price</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-success opacity-50" />
          <span>Buy Strike</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-destructive opacity-50" />
          <span>Sell Strike</span>
        </div>
      </div>
    </div>
  );
};
