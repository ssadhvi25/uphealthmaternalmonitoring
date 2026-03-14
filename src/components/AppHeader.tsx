import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AppSidebar from "./AppSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/articles": "Articles",
  "/runs": "Run Logs",
  "/settings": "Settings",
};

const AppHeader: React.FC = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Overview";

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-card shrink-0">
      {/* Mobile menu */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-2xl tracking-tight text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* UPSTC authenticity badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3 w-3" />
          STC Verified
        </div>

        <span className="text-xs text-muted-foreground hidden md:block">
          UP State Transformation Commission · Maternal Health Monitor
        </span>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground hidden sm:block">Live</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
