import { Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, Search, ChevronRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/fraud-operations": "Fraud Operations",
  "/cases": "Case Management",
  "/users": "User Intelligence",
  "/devices": "Device Intelligence",
  "/network": "Network Intelligence",
  "/analytics": "Fraud Analytics",
  "/operational-risk": "Operational Risk",
  "/cyber-security": "Cyber Security",
  "/consumer-protection": "Consumer Protection",
  "/risk-management": "Risk Management",
  "/rules": "Rule Management",
  "/scoring": "Risk Scoring Engine",
  "/blacklist": "Blacklist Management",
  "/regulatory": "Regulatory Reporting",
  "/audit": "Audit Trail",
  "/ml-analytics": "Machine Learning Analytics",
  "/administration": "Administration",
};

export function AppShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const title = titles[pathname] ?? "EFRMP";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Sentinel EFRMP</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts, cases, users, devices…"
                className="h-8 w-[320px] pl-8 text-xs"
              />
            </div>
            <Badge variant="outline" className="hidden gap-1.5 border-success/40 bg-success/10 text-success md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Live · GMT+7
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden bg-muted/30 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
