 import { Button } from "@/components/ui/button";
 import { User, ChevronDown, Globe } from "lucide-react";
 import { Link, useLocation } from "react-router-dom";
 import { cn } from "@/lib/utils";
 import { useTab } from "@/contexts/TabContext";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 
 export const Header = () => {
   const location = useLocation();
   const { activeTab } = useTab();
   
   // F&O navigation items (current)
    const foNavItems = [
      { path: "/fo", label: "Technical" },
      { path: "/live-market", label: "Live Market" },
      { path: "/oi-data", label: "OI Data" },
      { path: "/market-analysis", label: "Market Analysis" },
    ];
 
   const foCalendarItems = [
     { path: "/economic-calendar", label: "Economic Calendar" },
     { path: "/holiday-calendar", label: "Holiday Calendar" },
   ];
 
   // Stocks navigation items (placeholder)
    const stocksNavItems = [
      { path: "/stocks", label: "Dashboard" },
      { path: "/stocks/watchlist", label: "Watchlist" },
    ];

    const mfNavItems = [
      { path: "/mutual-funds", label: "Explore" },
      { path: "/mutual-funds?tab=sip", label: "SIP Calculator" },
      { path: "/mutual-funds?tab=swp", label: "SWP Calculator" },
    ];
 
   // Get nav items based on active tab
   const getNavItems = () => {
     switch (activeTab) {
       case "stocks":
         return stocksNavItems;
       case "mutual-funds":
         return mfNavItems;
       default:
         return foNavItems;
     }
   };
 
   const navItems = getNavItems();
   const showCalendar = activeTab === "fo";
   
   return (
     <header className="border-b bg-card sticky top-0 z-50">
       {/* Main Header */}
       <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
         <Link to={activeTab === "stocks" ? "/stocks" : activeTab === "fo" ? "/fo" : "/"} className="flex items-center gap-2 md:gap-3">
           <img 
             src="/hammr-logo.png" 
             alt="Hammr Logo" 
             className="h-12 w-12 md:h-16 md:w-16 object-contain"
           />
           <span className="text-xl md:text-2xl font-bold">Hammr</span>
         </Link>
         
         <div className="flex items-center gap-2">
           <Link to="/global-market">
             <Button 
               variant={location.pathname === "/global-market" ? "default" : "ghost"} 
               size="sm" 
               className={cn(
                 "gap-1 text-xs md:text-sm font-semibold",
                 location.pathname !== "/global-market" && 
                   "bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-300 text-black border-0 hover:from-emerald-400 hover:via-green-500 hover:to-emerald-400 shadow-sm"
               )}
             >
               <Globe className="h-4 w-4" />
               GLOBAL MARKET
             </Button>
           </Link>
           <Button variant="ghost" size="icon" className="hidden md:flex">
             <User className="h-5 w-5" />
           </Button>
         </div>
       </div>
 
       {/* Horizontal Scrollable Navigation */}
       <div className="border-t bg-muted/30 overflow-x-auto">
         <div className="container mx-auto px-4">
           <nav className="flex items-center gap-1 md:gap-4 py-2 min-w-max">
             {navItems.map((item) => {
                 const isActive = item.path.includes('?')
                   ? (location.pathname + location.search) === item.path
                   : location.pathname === item.path || (item.path === "/" && location.pathname === "/mutual-funds");
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
             
             {showCalendar && (
               <DropdownMenu>
                 <DropdownMenuTrigger className={cn(
                   "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                   (location.pathname === "/economic-calendar" || location.pathname === "/holiday-calendar")
                     ? "bg-primary text-primary-foreground"
                     : "text-muted-foreground hover:text-primary hover:bg-accent"
                 )}>
                   Calendar
                   <ChevronDown className="h-4 w-4" />
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="bg-background">
                   {foCalendarItems.map((item) => (
                     <DropdownMenuItem key={item.path} asChild>
                       <Link to={item.path} className="cursor-pointer">
                         {item.label}
                       </Link>
                     </DropdownMenuItem>
                   ))}
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
           </nav>
         </div>
       </div>
     </header>
   );
 };
