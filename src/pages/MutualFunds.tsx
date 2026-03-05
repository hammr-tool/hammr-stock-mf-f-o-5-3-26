import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MFExplorer } from "@/components/mutualfunds/MFExplorer";
import { SIPCalculator } from "@/components/mutualfunds/SIPCalculator";
import { SWPCalculator } from "@/components/mutualfunds/SWPCalculator";
import { ReturnsCalculator } from "@/components/mutualfunds/ReturnsCalculator";
import { FundComparison } from "@/components/mutualfunds/FundComparison";
import { Search, Calculator, Wallet } from "lucide-react";

const MutualFunds = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    tabFromUrl === "sip" ? "sip" : tabFromUrl === "swp" ? "swp" : tabFromUrl === "returns" ? "returns" : tabFromUrl === "compare" ? "compare" : "explore"
  );

  useEffect(() => {
    if (tabFromUrl === "sip") setActiveTab("sip");
    else if (tabFromUrl === "swp") setActiveTab("swp");
    else if (tabFromUrl === "returns") setActiveTab("returns");
    else if (tabFromUrl === "compare") setActiveTab("compare");
    else setActiveTab("explore");
  }, [tabFromUrl]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="explore">
            <MFExplorer slotAfterSearch={
              <TabsList className="w-full flex mb-6">
                <TabsTrigger value="returns" className="flex-1 gap-1 text-sm sm:text-base">Returns</TabsTrigger>
                <TabsTrigger value="compare" className="flex-1 gap-1 text-sm sm:text-base">Compare</TabsTrigger>
              </TabsList>
            } />
          </TabsContent>
          <TabsContent value="sip">
            <SIPCalculator />
            <TabsList className="w-full flex my-6">
              <TabsTrigger value="returns" className="flex-1 gap-1 text-sm sm:text-base">Returns</TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 gap-1 text-sm sm:text-base">Compare</TabsTrigger>
            </TabsList>
          </TabsContent>
          <TabsContent value="swp">
            <SWPCalculator />
            <TabsList className="w-full flex my-6">
              <TabsTrigger value="returns" className="flex-1 gap-1 text-sm sm:text-base">Returns</TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 gap-1 text-sm sm:text-base">Compare</TabsTrigger>
            </TabsList>
          </TabsContent>
          <TabsContent value="returns">
            <TabsList className="w-full flex mb-6">
              <TabsTrigger value="returns" className="flex-1 gap-1 text-sm sm:text-base">Returns</TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 gap-1 text-sm sm:text-base">Compare</TabsTrigger>
            </TabsList>
            <ReturnsCalculator />
          </TabsContent>
          <TabsContent value="compare">
            <TabsList className="w-full flex mb-6">
              <TabsTrigger value="returns" className="flex-1 gap-1 text-sm sm:text-base">Returns</TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 gap-1 text-sm sm:text-base">Compare</TabsTrigger>
            </TabsList>
            <FundComparison />
          </TabsContent>
        </Tabs>
      </main>
      <BottomTabBar />
    </div>
  );
};

export default MutualFunds;
