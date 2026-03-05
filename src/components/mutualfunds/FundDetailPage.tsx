import { useParams, useNavigate } from "react-router-dom";
import { useMutualFundDetail } from "@/hooks/useMutualFundData";
import { Header } from "@/components/Header";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, TrendingUp, Shield, IndianRupee, BarChart3 } from "lucide-react";

export const FundDetailPage = () => {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useMutualFundDetail(schemeCode);

  const fund = data?.fund;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-destructive">
              Fund not found or failed to load.
            </CardContent>
          </Card>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const riskColor = fund.riskLevel.includes("High") ? "text-red-500" :
                    fund.riskLevel.includes("Moderate") ? "text-yellow-500" : "text-green-500";

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Fund Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-xl font-bold">{fund.schemeName}</h1>
                <p className="text-sm text-muted-foreground">{fund.fundHouse}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{fund.schemeCategory}</Badge>
                  <Badge variant="outline" className={riskColor}>{fund.riskLevel}</Badge>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${i <= fund.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">NAV ({fund.date})</p>
                <p className="text-3xl font-bold text-primary">₹{fund.nav.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "1 Year Return", value: fund.return1Y },
            { label: "3 Year Return", value: fund.return3Y },
            { label: "5 Year Return", value: fund.return5Y },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${value >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {value >= 0 ? "+" : ""}{value}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fund Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Fund Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Scheme Code", value: fund.schemeCode },
                  { label: "Category", value: fund.schemeCategory },
                  { label: "Scheme Type", value: fund.schemeType },
                  { label: "Fund House", value: fund.fundHouse },
                  { label: "Benchmark", value: fund.benchmark },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IndianRupee className="h-5 w-5 text-primary" />
                Investment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "AUM", value: `₹${fund.aum.toFixed(0)} Cr` },
                  { label: "Expense Ratio", value: `${fund.expenseRatio}%` },
                  { label: "Min Investment", value: `₹${fund.minInvestment.toLocaleString()}` },
                  { label: "Min SIP", value: `₹${fund.minSIP.toLocaleString()}` },
                  { label: "Exit Load", value: fund.exitLoad },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  {["Low", "Moderate", "High", "Very High"].map((level) => (
                    <span key={level} className={`text-xs ${fund.riskLevel === level ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {level}
                    </span>
                  ))}
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary shadow-md"
                    style={{
                      left: `${fund.riskLevel === "Low" ? 12 : fund.riskLevel === "Low to Moderate" ? 25 : fund.riskLevel === "Moderate" ? 45 : fund.riskLevel === "High" ? 70 : 90}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomTabBar />
    </div>
  );
};
