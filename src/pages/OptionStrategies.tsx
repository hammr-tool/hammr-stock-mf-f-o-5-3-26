import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  LineChart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PayoffChart } from "@/components/PayoffChart";
 import { BottomTabBar } from "@/components/BottomTabBar";

type StrategyType = "all" | "bullish" | "bearish" | "neutral";

interface StrategyLeg {
  action: "Buy" | "Sell";
  type: "Call" | "Put";
  strike: number;
  premium: number;
}

interface StrategyExample {
  stockPrice: number;
  legs: StrategyLeg[];
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
}

interface Strategy {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  description: string;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  complexity: "beginner" | "intermediate" | "advanced";
  legs: number;
  detailedExplanation: string;
  whenToUse: string;
  example: StrategyExample;
  tips: string[];
  risks: string[];
}

const strategies: Strategy[] = [
  // Bullish Strategies
  {
    name: "Long Call",
    type: "bullish",
    description: "Buy a call option expecting the underlying to rise significantly.",
    maxProfit: "Unlimited",
    maxLoss: "Limited (premium paid)",
    breakeven: "Strike price + premium",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Long Call is the simplest bullish options strategy. You buy a call option, giving you the right (not obligation) to buy the stock at the strike price before expiration. You profit when the stock rises above the strike price plus the premium paid. This is ideal for beginners as it has limited risk (only the premium paid) with unlimited upside potential.",
    whenToUse: "Use when you are strongly bullish on a stock and expect significant upward movement before expiration. Best when implied volatility is low (options are cheaper). Ideal before expected positive news, earnings surprises, or breakouts.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Buy", type: "Call", strike: 23500, premium: 150 }],
      maxProfit: "Unlimited (Stock Price - Strike - Premium)",
      maxLoss: "₹150 × Lot Size (Premium Paid)",
      breakeven: "23650 (Strike 23500 + Premium 150)",
    },
    tips: [
      "Choose strike prices based on your price target - ATM for higher probability, OTM for higher reward",
      "Consider time decay - options lose value as expiration approaches, so give yourself enough time",
      "Higher implied volatility = more expensive premiums, so buy when IV is relatively low",
      "Set a stop loss at 50% of premium to limit losses if trade goes against you",
    ],
    risks: [
      "100% loss of premium if stock doesn't rise above breakeven by expiration",
      "Time decay (theta) works against you every day",
      "Volatility crush after events can reduce option value even if stock moves in your direction",
    ],
  },
  {
    name: "Bull Call Spread",
    type: "bullish",
    description: "Buy a call at lower strike and sell a call at higher strike. Limited risk and reward.",
    maxProfit: "Limited (difference between strikes - net premium)",
    maxLoss: "Limited (net premium paid)",
    breakeven: "Lower strike + net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Bull Call Spread involves buying a call at a lower strike and selling a call at a higher strike with the same expiration. The sold call reduces your cost but caps your profit. It's a cost-effective way to bet on moderate upside while defining your maximum risk upfront.",
    whenToUse: "Use when you're moderately bullish and have a specific price target. Great when you want to reduce the cost of buying calls outright. Best in moderate to high IV environments as you benefit from selling an option.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23500, premium: 150 },
        { action: "Sell", type: "Call", strike: 23700, premium: 70 },
      ],
      maxProfit: "₹120 × Lot Size (Spread 200 - Net Debit 80)",
      maxLoss: "₹80 × Lot Size (Net Debit: 150 - 70)",
      breakeven: "23580 (Lower Strike + Net Debit)",
    },
    tips: [
      "Choose strike width based on expected move - wider spreads = more profit potential but higher cost",
      "Sell the call at your target price level or just above resistance",
      "Best entered when IV is moderate to high for better premium on the sold leg",
      "Consider closing at 50-75% of max profit to lock in gains",
    ],
    risks: [
      "Profit is capped at the upper strike - you won't benefit from moves above it",
      "Both options expire worthless if stock falls below lower strike",
      "Assignment risk on short call if ITM near expiration (early assignment rare but possible)",
    ],
  },
  {
    name: "Bull Put Spread",
    type: "bullish",
    description: "Sell a put at higher strike and buy a put at lower strike. Credit spread strategy.",
    maxProfit: "Limited (net premium received)",
    maxLoss: "Limited (difference between strikes - net premium)",
    breakeven: "Higher strike - net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Bull Put Spread is a credit spread where you sell a put at a higher strike and buy a put at a lower strike for protection. You collect a credit upfront and profit if the stock stays above the sold strike. Time decay works in your favor.",
    whenToUse: "Use when moderately bullish and want to collect premium rather than pay for it. Ideal when IV is high and you expect support levels to hold. Great for generating income while being bullish.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Put", strike: 23400, premium: 90 },
        { action: "Buy", type: "Put", strike: 23200, premium: 35 },
      ],
      maxProfit: "₹55 × Lot Size (Net Credit: 90 - 35)",
      maxLoss: "₹145 × Lot Size (Spread 200 - Credit 55)",
      breakeven: "23345 (Sold Strike 23400 - Credit 55)",
    },
    tips: [
      "Sell at support levels for higher probability of success",
      "Close at 50% profit to manage risk and free up capital",
      "Roll down and out if threatened rather than taking max loss",
      "Best when IV rank is high (>50%) for better credit received",
    ],
    risks: [
      "Full loss occurs if stock drops below lower strike at expiration",
      "Assignment risk on short put if deep ITM",
      "Requires margin in most brokerages",
    ],
  },
  {
    name: "Cash Secured Put",
    type: "bullish",
    description: "Sell a put option while keeping cash to buy shares if assigned.",
    maxProfit: "Limited (premium received)",
    maxLoss: "Substantial (strike price - premium)",
    breakeven: "Strike price - premium",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "Selling a cash-secured put means you sell a put option while holding enough cash to buy 100 shares if assigned. It's a way to get paid while waiting to buy a stock at a lower price. If the stock stays above the strike, you keep the premium as profit.",
    whenToUse: "Use when you want to buy a stock but at a lower price, or to generate income on cash. Great when you're willing to own the stock if assigned. Best in high IV environments for better premiums.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Sell", type: "Put", strike: 23300, premium: 85 }],
      maxProfit: "₹85 × Lot Size (Premium received)",
      maxLoss: "₹23,215 × Lot Size (if stock goes to 0)",
      breakeven: "23215 (Strike 23300 - Premium 85)",
    },
    tips: [
      "Only sell puts on stocks you genuinely want to own",
      "Choose strikes at good support levels or target entry prices",
      "Sell puts 30-45 days to expiration for optimal theta decay",
      "Have a plan ready if you get assigned - either hold or sell covered calls",
    ],
    risks: [
      "Large losses possible if stock drops significantly",
      "Ties up capital as margin requirement",
      "Assignment means you must buy 100 shares at strike price",
    ],
  },
  {
    name: "Call Ratio Back Spread",
    type: "bullish",
    description: "Sell one call at lower strike and buy two calls at higher strike.",
    maxProfit: "Unlimited",
    maxLoss: "Limited",
    breakeven: "Multiple breakeven points",
    complexity: "advanced",
    legs: 2,
    detailedExplanation: "A Call Ratio Back Spread involves selling one call at a lower strike and buying two (or more) calls at a higher strike. This can often be done for a credit or small debit. You profit from large upward moves while having limited risk if the stock falls.",
    whenToUse: "Use when expecting a large upward move but want limited or no downside risk. Ideal before major bullish catalysts. Best when IV is expected to increase.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Call", strike: 23500, premium: 150 },
        { action: "Buy", type: "Call", strike: 23700, premium: 70 },
        { action: "Buy", type: "Call", strike: 23700, premium: 70 },
      ],
      maxProfit: "Unlimited above upper breakeven",
      maxLoss: "₹10 × Lot Size (at 23700 = strike width 200 - credit 10)",
      breakeven: "23510 and 23890",
    },
    tips: [
      "Try to enter for a credit so you profit if stock falls or stays flat",
      "The higher the ratio (2:1, 3:1), the more you benefit from large moves",
      "Works best with volatile stocks prone to big moves",
      "Consider closing if stock approaches the sold strike near expiration",
    ],
    risks: [
      "Maximum loss occurs at the bought strike at expiration",
      "Requires precise timing and large moves to profit",
      "Complex to manage and adjust",
    ],
  },
  // Bearish Strategies
  {
    name: "Long Put",
    type: "bearish",
    description: "Buy a put option expecting the underlying to fall significantly.",
    maxProfit: "Substantial (strike price - premium)",
    maxLoss: "Limited (premium paid)",
    breakeven: "Strike price - premium",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Long Put gives you the right to sell the stock at the strike price before expiration. You profit when the stock falls below the strike price minus the premium paid. It's like insurance against a stock decline and is the simplest bearish strategy.",
    whenToUse: "Use when strongly bearish on a stock or want to hedge your long stock positions. Best when implied volatility is low (puts are cheaper). Ideal before expected negative news or technical breakdowns.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Buy", type: "Put", strike: 23500, premium: 140 }],
      maxProfit: "₹23,360 × Lot Size (if stock goes to 0)",
      maxLoss: "₹140 × Lot Size (Premium Paid)",
      breakeven: "23360 (Strike 23500 - Premium 140)",
    },
    tips: [
      "Great for portfolio protection during uncertain times",
      "Buy puts when IV is low for cheaper protection",
      "Consider longer expiration for more time to be right on direction",
      "ATM puts have higher delta and move more with the stock",
    ],
    risks: [
      "100% loss of premium if stock doesn't fall enough by expiration",
      "Time decay accelerates significantly near expiration",
      "Stock can remain flat, causing total loss of premium",
    ],
  },
  {
    name: "Bear Put Spread",
    type: "bearish",
    description: "Buy a put at higher strike and sell a put at lower strike. Limited risk and reward.",
    maxProfit: "Limited (difference between strikes - net premium)",
    maxLoss: "Limited (net premium paid)",
    breakeven: "Higher strike - net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Bear Put Spread involves buying a put at a higher strike and selling a put at a lower strike with the same expiration. The sold put reduces your cost but limits your profit. It's a cost-effective way to profit from moderate downward moves.",
    whenToUse: "Use when moderately bearish and want to reduce the cost of buying puts outright. Great when you have a specific downside target. Best when IV is moderate.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Put", strike: 23500, premium: 140 },
        { action: "Sell", type: "Put", strike: 23300, premium: 65 },
      ],
      maxProfit: "₹125 × Lot Size (Spread 200 - Net Debit 75)",
      maxLoss: "₹75 × Lot Size (Net Debit: 140 - 65)",
      breakeven: "23425 (Higher Strike - Net Debit)",
    },
    tips: [
      "Select strikes based on support levels - sell put at expected support",
      "Closer strikes = lower cost but less profit potential",
      "Consider earnings and events for timing",
      "Close at 50-75% profit to manage risk",
    ],
    risks: [
      "Profit capped at lower strike",
      "Requires significant downward movement to profit",
      "Time decay affects the long put more than the short put",
    ],
  },
  {
    name: "Bear Call Spread",
    type: "bearish",
    description: "Sell a call at lower strike and buy a call at higher strike. Credit spread strategy.",
    maxProfit: "Limited (net premium received)",
    maxLoss: "Limited (difference between strikes - net premium)",
    breakeven: "Lower strike + net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Bear Call Spread sells a call at a lower strike and buys a call at a higher strike for protection. You collect a credit upfront and profit if the stock stays below the sold strike. Time decay works in your favor.",
    whenToUse: "Use when moderately bearish and want to collect premium. Ideal when IV is high and you expect resistance levels to hold. Great for income generation with a bearish bias.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Call", strike: 23600, premium: 85 },
        { action: "Buy", type: "Call", strike: 23800, premium: 30 },
      ],
      maxProfit: "₹55 × Lot Size (Net Credit: 85 - 30)",
      maxLoss: "₹145 × Lot Size (Spread 200 - Credit 55)",
      breakeven: "23655 (Sold Strike + Credit)",
    },
    tips: [
      "Sell at resistance levels for higher probability of success",
      "Higher probability when selling OTM (above current price)",
      "Close early if profit target (50%) is reached",
      "Best when IV rank is elevated",
    ],
    risks: [
      "Rally above upper strike results in max loss",
      "Assignment risk if ITM at expiration",
      "Gap ups can cause quick losses",
    ],
  },
  {
    name: "Put Ratio Back Spread",
    type: "bearish",
    description: "Sell one put at higher strike and buy two puts at lower strike.",
    maxProfit: "Substantial",
    maxLoss: "Limited",
    breakeven: "Multiple breakeven points",
    complexity: "advanced",
    legs: 2,
    detailedExplanation: "A Put Ratio Back Spread involves selling one put at a higher strike and buying two (or more) puts at a lower strike. This can often be done for a credit. You profit from large downward moves while having limited risk if the stock rises.",
    whenToUse: "Use when expecting a large downward move but want limited upside risk. Ideal before major bearish catalysts like negative earnings or market crashes.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Put", strike: 23500, premium: 140 },
        { action: "Buy", type: "Put", strike: 23300, premium: 65 },
        { action: "Buy", type: "Put", strike: 23300, premium: 65 },
      ],
      maxProfit: "Substantial (if stock crashes to 0)",
      maxLoss: "₹10 × Lot Size (at 23300)",
      breakeven: "23490 and 23110",
    },
    tips: [
      "Try to enter for a credit so you profit if stock rises",
      "Works best with volatile stocks prone to crashes",
      "Great hedge for long portfolios during uncertainty",
      "Consider as a tail risk hedge",
    ],
    risks: [
      "Maximum loss occurs at the bought strike at expiration",
      "Requires large move to profit significantly",
      "Can be complex to manage",
    ],
  },
  // Neutral Strategies
  {
    name: "Iron Condor",
    type: "neutral",
    description: "Sell OTM call and put spreads. Profits when price stays in range.",
    maxProfit: "Limited (net premium received)",
    maxLoss: "Limited (width of wider spread - net premium)",
    breakeven: "Two breakeven points within the wings",
    complexity: "advanced",
    legs: 4,
    detailedExplanation: "An Iron Condor combines a Bull Put Spread and a Bear Call Spread. You sell options on both sides, collecting premium and betting the stock will stay within a range. It profits from time decay and low volatility. This is the most popular income-generating options strategy.",
    whenToUse: "Use when you expect low volatility and the stock to stay in a range. Best after high IV events (like earnings) when premium is rich and you expect volatility to decrease.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Put", strike: 23100, premium: 25 },
        { action: "Sell", type: "Put", strike: 23200, premium: 45 },
        { action: "Sell", type: "Call", strike: 23800, premium: 40 },
        { action: "Buy", type: "Call", strike: 23900, premium: 20 },
      ],
      maxProfit: "₹40 × Lot Size (Net Credit: 45+40-25-20)",
      maxLoss: "₹60 × Lot Size (Spread 100 - Credit 40)",
      breakeven: "23160 (put side) and 23840 (call side)",
    },
    tips: [
      "Enter when IV rank is high (>50%) for better premium",
      "Manage at 50% profit to lock in gains and reduce risk",
      "Keep width of spreads equal for balanced risk on both sides",
      "Choose expiration 30-45 days out for optimal theta decay",
    ],
    risks: [
      "Large moves in either direction cause max loss",
      "Requires active management as price approaches short strikes",
      "Gap moves can cause significant losses beyond breakevens",
    ],
  },
  {
    name: "Iron Butterfly",
    type: "neutral",
    description: "Sell ATM call and put, buy OTM call and put. Best for low volatility expectations.",
    maxProfit: "Limited (net premium received)",
    maxLoss: "Limited (wing width - net premium)",
    breakeven: "ATM strike ± net premium",
    complexity: "advanced",
    legs: 4,
    detailedExplanation: "An Iron Butterfly sells an ATM call and put while buying OTM options for protection on both sides. It has higher profit potential than an Iron Condor but a narrower profit zone. Best when you expect the stock to stay exactly at the current price.",
    whenToUse: "Use when you expect the stock to stay very close to the current price. Ideal for pinning scenarios (options expiration) or when you expect extremely low movement.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Put", strike: 23300, premium: 30 },
        { action: "Sell", type: "Put", strike: 23500, premium: 140 },
        { action: "Sell", type: "Call", strike: 23500, premium: 150 },
        { action: "Buy", type: "Call", strike: 23700, premium: 35 },
      ],
      maxProfit: "₹225 × Lot Size (Net Credit: 140+150-30-35)",
      maxLoss: "Loss on wings if breached (Spread - Credit)",
      breakeven: "23275 and 23725",
    },
    tips: [
      "Best for weekly options near expiration when theta is highest",
      "Higher risk-reward ratio than Iron Condor",
      "Manage early if stock moves away from center strike",
      "Consider adjusting wings if stock moves before expiration",
    ],
    risks: [
      "Narrow profit zone requires stock to stay near ATM strike",
      "Any significant movement in either direction causes losses",
      "Requires close monitoring especially near expiration",
    ],
  },
  {
    name: "Long Straddle",
    type: "neutral",
    description: "Buy ATM call and put. Profits from large moves in either direction.",
    maxProfit: "Unlimited",
    maxLoss: "Limited (total premium paid)",
    breakeven: "Strike ± total premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Long Straddle involves buying both a call and put at the same ATM strike price and expiration. You profit from large moves in either direction. The stock needs to move enough to cover the cost of both options. It's a volatility play - you're betting on movement, not direction.",
    whenToUse: "Use before major events like earnings, FDA approvals, election results, or other catalysts when you expect a big move but are unsure of direction. Best when IV is low relative to expected movement.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23500, premium: 150 },
        { action: "Buy", type: "Put", strike: 23500, premium: 140 },
      ],
      maxProfit: "Unlimited (on upside) / Substantial (on downside)",
      maxLoss: "₹290 × Lot Size (Total Premium: 150 + 140)",
      breakeven: "23210 (down) and 23790 (up)",
    },
    tips: [
      "Buy when IV is low and expected to spike (before events)",
      "Close before expiration to salvage remaining time value",
      "Look for stocks with upcoming catalysts that could move price significantly",
      "Consider closing one leg if a strong directional move occurs",
    ],
    risks: [
      "Very expensive strategy - requires large move to profit",
      "Time decay hurts both legs every day",
      "IV crush after events can cause losses even if stock moves",
    ],
  },
  {
    name: "Long Strangle",
    type: "neutral",
    description: "Buy OTM call and put. Cheaper than straddle, needs larger move.",
    maxProfit: "Unlimited",
    maxLoss: "Limited (total premium paid)",
    breakeven: "Two breakeven points outside the strikes",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Long Strangle is similar to a straddle but uses OTM options instead of ATM. This makes it cheaper to enter, but the stock needs to move more to be profitable. Good for expecting big moves while spending less capital.",
    whenToUse: "Use when you expect a large move but want to spend less than a straddle. Good for volatile stocks before major events. Best when IV is low.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23700, premium: 70 },
        { action: "Buy", type: "Put", strike: 23300, premium: 65 },
      ],
      maxProfit: "Unlimited",
      maxLoss: "₹135 × Lot Size (Total Premium: 70 + 65)",
      breakeven: "23165 (down) and 23835 (up)",
    },
    tips: [
      "Cheaper alternative to straddles with same unlimited potential",
      "Choose strikes based on expected range - wider = cheaper but needs bigger move",
      "Consider delta of options for probability of profit",
      "Best when you expect the move to be much larger than the range width",
    ],
    risks: [
      "Needs larger move than straddle to profit",
      "Both options can expire worthless if stock stays in range",
      "IV crush is still a major risk after events",
    ],
  },
  {
    name: "Short Straddle",
    type: "neutral",
    description: "Sell ATM call and put. Profits when price stays near strike.",
    maxProfit: "Limited (total premium received)",
    maxLoss: "Unlimited",
    breakeven: "Strike ± total premium",
    complexity: "advanced",
    legs: 2,
    detailedExplanation: "A Short Straddle sells both a call and put at the same ATM strike. You collect premium and profit if the stock stays near the strike. However, you face unlimited risk if the stock moves significantly in either direction. This is a high-risk income strategy.",
    whenToUse: "Use when you expect extremely low volatility and the stock to pin at the current price. Best after high IV events when premium is rich. Only for experienced traders comfortable with unlimited risk.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Call", strike: 23500, premium: 150 },
        { action: "Sell", type: "Put", strike: 23500, premium: 140 },
      ],
      maxProfit: "₹290 × Lot Size (Total Premium received)",
      maxLoss: "Unlimited in either direction",
      breakeven: "23210 (down) and 23790 (up)",
    },
    tips: [
      "Only trade if comfortable with unlimited risk",
      "Have strict stop losses in place before entering",
      "Best when IV is extremely elevated and expected to fall",
      "Consider converting to Iron Butterfly if trade goes against you",
    ],
    risks: [
      "Unlimited loss potential in both directions",
      "Gap moves can cause catastrophic losses",
      "Requires large margin and constant monitoring",
    ],
  },
  {
    name: "Short Strangle",
    type: "neutral",
    description: "Sell OTM call and put. Profits when price stays between strikes.",
    maxProfit: "Limited (total premium received)",
    maxLoss: "Unlimited",
    breakeven: "Two breakeven points outside the strikes",
    complexity: "advanced",
    legs: 2,
    detailedExplanation: "A Short Strangle sells OTM call and put options, collecting premium from both. You profit if the stock stays between the two strikes. It has a wider profit zone than a short straddle but collects less premium. Still has unlimited risk.",
    whenToUse: "Use when expecting low volatility and stock to stay in a range. Best after high IV events. Wider profit zone than short straddle but unlimited risk remains.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Call", strike: 23700, premium: 70 },
        { action: "Sell", type: "Put", strike: 23300, premium: 65 },
      ],
      maxProfit: "₹135 × Lot Size (Total Premium received)",
      maxLoss: "Unlimited outside the range",
      breakeven: "23165 (down) and 23835 (up)",
    },
    tips: [
      "Wider strikes = higher probability but less premium",
      "Manage at 50% profit to reduce time in trade",
      "Consider rolling untested side closer for more credit",
      "Always have a stop loss or defined exit plan",
    ],
    risks: [
      "Unlimited loss if stock moves significantly beyond either strike",
      "Requires large margin",
      "Gap moves are particularly dangerous",
    ],
  },
  {
    name: "Calendar Spread",
    type: "neutral",
    description: "Sell near-term option and buy longer-term option at same strike.",
    maxProfit: "Limited",
    maxLoss: "Limited (net debit paid)",
    breakeven: "Depends on time decay",
    complexity: "advanced",
    legs: 2,
    detailedExplanation: "A Calendar Spread (or Time Spread) exploits the difference in time decay between near-term and longer-term options. You sell the faster-decaying near-term option and buy the slower-decaying longer-term option at the same strike. Profits from time decay and stable prices.",
    whenToUse: "Use when expecting low volatility in the near term but potentially higher later. Best when IV is expected to rise in the future. Ideal for earning premium while maintaining a position.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Sell", type: "Call", strike: 23500, premium: 80 },
        { action: "Buy", type: "Call", strike: 23500, premium: 150 },
      ],
      maxProfit: "Variable (depends on IV and stock price at front expiration)",
      maxLoss: "₹70 × Lot Size (Net Debit: 150 - 80)",
      breakeven: "Around strike price at near-term expiration",
    },
    tips: [
      "Best when IV is low and expected to rise for the back month",
      "ATM calendars have highest theta capture",
      "Close before near-term expiration to avoid pin risk",
      "Consider the IV differential between months",
    ],
    risks: [
      "Large moves in either direction hurt the position",
      "IV crush on back month option causes losses",
      "Complex to manage and requires understanding of multiple expirations",
    ],
  },
  {
    name: "Butterfly Spread",
    type: "neutral",
    description: "Buy 1 ITM, sell 2 ATM, buy 1 OTM options. Low cost, limited risk.",
    maxProfit: "Limited",
    maxLoss: "Limited (net premium paid)",
    breakeven: "Multiple breakeven points",
    complexity: "advanced",
    legs: 4,
    detailedExplanation: "A Butterfly Spread involves buying one lower strike option, selling two middle strike options, and buying one higher strike option. All options have the same expiration. It profits when the stock finishes near the middle strike at expiration.",
    whenToUse: "Use when you expect the stock to finish at a specific price at expiration. Great for pinning scenarios. Very low cost entry with defined risk.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23400, premium: 180 },
        { action: "Sell", type: "Call", strike: 23500, premium: 150 },
        { action: "Sell", type: "Call", strike: 23500, premium: 150 },
        { action: "Buy", type: "Call", strike: 23600, premium: 85 },
      ],
      maxProfit: "₹85 × Lot Size at center strike (100 - Net Debit 15)",
      maxLoss: "₹15 × Lot Size (Net Debit)",
      breakeven: "23415 and 23585",
    },
    tips: [
      "Best used near expiration when you have a strong price target",
      "Very cheap to enter relative to potential reward",
      "Consider using weekly options for lower cost",
      "Can be constructed with all calls, all puts, or a combination",
    ],
    risks: [
      "Narrow profit zone - stock must finish near center strike",
      "Most of the position loses money if stock moves away from center",
      "Execution can be tricky with 4 legs",
    ],
  },
  {
    name: "Covered Call",
    type: "neutral",
    description: "Own the stock and sell a call option against it for income.",
    maxProfit: "Limited (strike - stock price + premium)",
    maxLoss: "Substantial (stock can go to zero)",
    breakeven: "Stock price - premium received",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Covered Call involves owning shares of stock and selling a call option against them. You collect premium income while holding the stock. If the stock rises above the strike, your shares get called away at the strike price. It's a conservative income-generating strategy.",
    whenToUse: "Use when you own stock and are willing to sell at a higher price. Great for generating income in sideways or slightly bullish markets. Ideal for long-term holdings where you want to reduce cost basis.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Sell", type: "Call", strike: 23700, premium: 70 }],
      maxProfit: "₹270 × Lot Size (Strike 23700 - Stock 23500 + Premium 70)",
      maxLoss: "₹23,430 × Lot Size (if stock goes to 0, reduced by premium)",
      breakeven: "23430 (Stock Price - Premium)",
    },
    tips: [
      "Sell calls at resistance levels where you'd be happy to sell",
      "Choose expiration 30-45 days out for optimal theta decay",
      "Be prepared to have shares called away if stock rallies",
      "Roll the call if you want to keep the shares",
    ],
    risks: [
      "Caps upside potential - you miss gains above strike",
      "Still exposed to full downside stock risk",
      "May miss large rallies by having shares called away",
    ],
  },
  {
    name: "Protective Collar",
    type: "neutral",
    description: "Own stock, buy put for protection, sell call to offset put cost.",
    maxProfit: "Limited (call strike - stock price)",
    maxLoss: "Limited (stock price - put strike)",
    breakeven: "Stock price + net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Protective Collar combines owning stock with buying a put for downside protection and selling a call to offset the put cost. It creates a defined range of outcomes - you limit both gains and losses. Often used by institutions to protect gains.",
    whenToUse: "Use when you want to protect stock gains without selling. Great before uncertain events. Ideal when you can't afford to lose but still want some upside exposure.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Put", strike: 23300, premium: 65 },
        { action: "Sell", type: "Call", strike: 23700, premium: 70 },
      ],
      maxProfit: "₹205 × Lot Size (to call strike) + ₹5 credit",
      maxLoss: "₹195 × Lot Size (to put strike) - ₹5 credit",
      breakeven: "23495 (Stock - Net Credit 5)",
    },
    tips: [
      "Can often be done for zero cost or a small credit",
      "Choose put strike at a level you're comfortable losing to",
      "Choose call strike where you'd be happy to sell",
      "Roll the collar out in time to maintain protection",
    ],
    risks: [
      "Gives up upside above the call strike",
      "Put protection expires - must be renewed",
      "Transaction costs for 2 options plus stock",
    ],
  },
];

const OptionStrategies = () => {
  const location = useLocation();
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<StrategyType>("all");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  // Handle hash navigation to calculator
  useEffect(() => {
    if (location.hash === "#calculator") {
      setShowCalculator(true);
      // Small delay to ensure the calculator is rendered before scrolling
      setTimeout(() => {
        calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  // Calculator state
  const [calcInputs, setCalcInputs] = useState({
    stockPrice: "",
    strike1: "",
    premium1: "",
    action1: "Buy" as "Buy" | "Sell",
    type1: "Call" as "Call" | "Put",
    strike2: "",
    premium2: "",
    action2: "Sell" as "Buy" | "Sell",
    type2: "Call" as "Call" | "Put",
    lotSize: "75",
  });

  const filteredStrategies = strategies.filter(
    (strategy) => filter === "all" || strategy.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bullish":
        return <TrendingUp className="h-3 w-3" />;
      case "bearish":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "bullish":
        return "bg-success/20 text-success border-success/30";
      case "bearish":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-secondary/50 text-secondary-foreground border-secondary";
    }
  };

  const getComplexityBadgeClass = (complexity: string) => {
    switch (complexity) {
      case "beginner":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-secondary/50 text-secondary-foreground";
    }
  };

  // Calculator functions
  const calculateResults = () => {
    const strike1 = parseFloat(calcInputs.strike1) || 0;
    const premium1 = parseFloat(calcInputs.premium1) || 0;
    const strike2 = parseFloat(calcInputs.strike2) || 0;
    const premium2 = parseFloat(calcInputs.premium2) || 0;
    const lotSize = parseFloat(calcInputs.lotSize) || 1;

    // Calculate net debit/credit
    let netCost = 0;
    netCost += calcInputs.action1 === "Buy" ? premium1 : -premium1;
    if (strike2 && premium2) {
      netCost += calcInputs.action2 === "Buy" ? premium2 : -premium2;
    }

    const spreadWidth = Math.abs(strike2 - strike1);

    // Calculate based on strategy type
    let maxProfit = 0;
    let maxLoss = 0;
    let breakeven = 0;

    if (netCost > 0) {
      // Debit spread (Bull Call, Bear Put)
      maxLoss = netCost;
      maxProfit = spreadWidth - netCost;
      breakeven = strike1 + netCost;
    } else {
      // Credit spread (Bull Put, Bear Call)
      maxProfit = Math.abs(netCost);
      maxLoss = spreadWidth - Math.abs(netCost);
      breakeven = strike1 + netCost;
    }

    return {
      netCost: (netCost * lotSize).toFixed(2),
      maxProfit: (maxProfit * lotSize).toFixed(2),
      maxLoss: (maxLoss * lotSize).toFixed(2),
      breakeven: breakeven.toFixed(2),
      isCredit: netCost < 0,
    };
  };

  const calcResults = calculateResults();

  return (
     <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg md:text-xl font-bold">Option Strategies</h1>
        </div>

        {/* Strategy Calculator */}
        <Card ref={calculatorRef} id="calculator" className="border-success/30 bg-success/5">
          <div className="p-3">
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full bg-gradient-to-r from-success/80 to-success hover:from-success hover:to-success/80 text-white"
              size="sm"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Strategy Calculator
              {showCalculator ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>

            {showCalculator && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Price</Label>
                    <Input
                      type="number"
                      placeholder="23500"
                      value={calcInputs.stockPrice}
                      onChange={(e) => setCalcInputs({ ...calcInputs, stockPrice: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Lot Size</Label>
                    <Input
                      type="number"
                      placeholder="75"
                      value={calcInputs.lotSize}
                      onChange={(e) => setCalcInputs({ ...calcInputs, lotSize: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Leg 1 */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-medium">Leg 1</p>
                  <div className="grid grid-cols-4 gap-2">
                    <select
                      value={calcInputs.action1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, action1: e.target.value as "Buy" | "Sell" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                    <select
                      value={calcInputs.type1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, type1: e.target.value as "Call" | "Put" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Call">Call</option>
                      <option value="Put">Put</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Strike"
                      value={calcInputs.strike1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, strike1: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Premium"
                      value={calcInputs.premium1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, premium1: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Leg 2 */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-medium">Leg 2 (Optional)</p>
                  <div className="grid grid-cols-4 gap-2">
                    <select
                      value={calcInputs.action2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, action2: e.target.value as "Buy" | "Sell" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                    <select
                      value={calcInputs.type2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, type2: e.target.value as "Call" | "Put" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Call">Call</option>
                      <option value="Put">Put</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Strike"
                      value={calcInputs.strike2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, strike2: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Premium"
                      value={calcInputs.premium2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, premium2: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Results */}
                {calcInputs.strike1 && calcInputs.premium1 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-border/50">
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {calcResults.isCredit ? "Net Credit" : "Net Debit"}
                      </p>
                      <p className={`text-sm font-bold ${calcResults.isCredit ? "text-success" : "text-amber-400"}`}>
                        ₹{Math.abs(parseFloat(calcResults.netCost)).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Max Profit</p>
                      <p className="text-sm font-bold text-success">₹{calcResults.maxProfit}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Max Loss</p>
                      <p className="text-sm font-bold text-destructive">₹{calcResults.maxLoss}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Breakeven</p>
                      <p className="text-sm font-bold text-blue-400">₹{calcResults.breakeven}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs whitespace-nowrap"
          >
            All Strategies
          </Button>
          <Button
            variant={filter === "bullish" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bullish")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Bullish
          </Button>
          <Button
            variant={filter === "bearish" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bearish")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <TrendingDown className="h-3 w-3" />
            Bearish
          </Button>
          <Button
            variant={filter === "neutral" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("neutral")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <Minus className="h-3 w-3" />
            Neutral
          </Button>
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStrategies.map((strategy) => (
            <Card
              key={strategy.name}
              className="p-3 space-y-2 cursor-pointer hover:border-success/50 transition-colors"
              onClick={() => setSelectedStrategy(strategy)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{strategy.name}</h3>
                <div className="flex gap-1 flex-wrap justify-end">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 gap-1 ${getTypeBadgeClass(strategy.type)}`}
                  >
                    {getTypeIcon(strategy.type)}
                    {strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 ${getComplexityBadgeClass(strategy.complexity)}`}
                  >
                    {strategy.complexity}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {strategy.description}
              </p>

              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Legs:</span>
                  <span className="font-medium">{strategy.legs}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max Profit:</span>
                  <span className="text-success font-medium">{strategy.maxProfit}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max Loss:</span>
                  <span className="text-destructive font-medium">{strategy.maxLoss}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                <BookOpen className="w-3 h-3" />
                <span>Tap for detailed explanation</span>
              </div>
            </Card>
          ))}
        </div>

        {filteredStrategies.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No strategies found for the selected filter.
            </p>
          </Card>
        )}
      </main>

      {/* Strategy Detail Dialog */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap text-lg">
                  <span>{selectedStrategy.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 gap-1 ${getTypeBadgeClass(selectedStrategy.type)}`}
                  >
                    {getTypeIcon(selectedStrategy.type)}
                    {selectedStrategy.type.charAt(0).toUpperCase() + selectedStrategy.type.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 ${getComplexityBadgeClass(selectedStrategy.complexity)}`}
                  >
                    {selectedStrategy.complexity}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-3">
                {/* Overview */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    What is {selectedStrategy.name}?
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStrategy.detailedExplanation}
                  </p>
                </div>

                {/* When to Use */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <Target className="w-4 h-4 text-success" />
                    When to Use This Strategy
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStrategy.whenToUse}
                  </p>
                </div>

                {/* Payoff Diagram */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-3">
                    <LineChart className="w-4 h-4 text-primary" />
                    Payoff Diagram
                  </h4>
                  <PayoffChart
                    stockPrice={selectedStrategy.example.stockPrice}
                    legs={selectedStrategy.example.legs}
                    lotSize={75}
                  />
                </div>

                {/* Live Example */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-3">
                    📊 Example (Current Price: ₹{selectedStrategy.example.stockPrice})
                  </h4>

                  <div className="space-y-2 mb-3">
                    {selectedStrategy.example.legs.map((leg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded text-xs ${
                          leg.action === "Buy"
                            ? "bg-success/10 border border-success/30"
                            : "bg-destructive/10 border border-destructive/30"
                        }`}
                      >
                        <span className="font-medium">
                          {leg.action} {leg.type} @ ₹{leg.strike}
                        </span>
                        <span className={leg.action === "Buy" ? "text-destructive" : "text-success"}>
                          {leg.action === "Buy" ? "-" : "+"}₹{leg.premium}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Max Profit</p>
                      <p className="text-xs font-semibold text-success">{selectedStrategy.example.maxProfit}</p>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Max Loss</p>
                      <p className="text-xs font-semibold text-destructive">{selectedStrategy.example.maxLoss}</p>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Breakeven</p>
                      <p className="text-xs font-semibold text-blue-400">{selectedStrategy.example.breakeven}</p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStrategy.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-success mt-0.5">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Key Risks to Watch
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStrategy.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-destructive mt-0.5">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Reference */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Legs Required</p>
                    <p className="text-lg font-bold">{selectedStrategy.legs}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Skill Level</p>
                    <p className="text-sm font-bold capitalize">{selectedStrategy.complexity}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Market View</p>
                    <p className="text-sm font-bold capitalize">{selectedStrategy.type}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
       <BottomTabBar />
     </div>
  );
};

export default OptionStrategies;
