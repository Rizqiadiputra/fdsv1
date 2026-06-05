import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShieldAlert,
  Folder,
  Users,
  Smartphone,
  Network,
  BarChart3,
  Activity,
  Lock,
  HeartHandshake,
  GaugeCircle,
  Sliders,
  Calculator,
  Ban,
  FileText,
  ScrollText,
  Brain,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const groups: {
  label: string;
  items: { title: string; url: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Command Center",
    items: [
      { title: "Executive Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Fraud Operations", url: "/fraud-operations", icon: ShieldAlert },
      { title: "Case Management", url: "/cases", icon: Folder },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "User Intelligence", url: "/users", icon: Users },
      { title: "Device Intelligence", url: "/devices", icon: Smartphone },
      { title: "Network Intelligence", url: "/network", icon: Network },
      { title: "Fraud Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Risk & Security",
    items: [
      { title: "Operational Risk", url: "/operational-risk", icon: Activity },
      { title: "Cyber Security", url: "/cyber-security", icon: Lock },
      { title: "Consumer Protection", url: "/consumer-protection", icon: HeartHandshake },
      { title: "Risk Management", url: "/risk-management", icon: GaugeCircle },
    ],
  },
  {
    label: "Engine & Policy",
    items: [
      { title: "Rule Management", url: "/rules", icon: Sliders },
      { title: "Risk Scoring Engine", url: "/scoring", icon: Calculator },
      { title: "Blacklist Management", url: "/blacklist", icon: Ban },
      { title: "ML Analytics", url: "/ml-analytics", icon: Brain },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Regulatory Reporting", url: "/regulatory", icon: FileText },
      { title: "Audit Trail", url: "/audit", icon: ScrollText },
      { title: "Administration", url: "/administration", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              SENTINEL
            </span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              EFRMP · v4.2
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            AP
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground">Andini Putri</span>
            <span className="text-[10px] text-sidebar-foreground/60">Fraud Manager · GMT+7</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
