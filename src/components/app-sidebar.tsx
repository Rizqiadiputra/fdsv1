import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShieldAlert,
  Folder,
  Users,
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
  Settings,
  ShieldCheck,
  Zap,
  Store,
  UserCheck,
  TrendingDown,
  MessageSquareWarning,
  ShieldQuestion,
  BookCheck,
  Megaphone,
  Siren,
  LogOut,
  User as UserIcon,
  KeyRound,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { logout, useAppStore } from "@/lib/app-store";
import { canAccess, ROLE_LABEL } from "@/lib/rbac";

const groups: {
  label: string;
  items: { title: string; url: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Wajib Regulasi (BI/OJK)",
    items: [
      { title: "Executive Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Real-Time Tx Monitoring", url: "/transaction-monitoring", icon: Zap },
      { title: "Fraud Operations", url: "/fraud-operations", icon: ShieldAlert },
      { title: "Suspicious Transactions", url: "/suspicious", icon: ShieldQuestion },
      { title: "Case Management", url: "/cases", icon: Folder },
      { title: "Confirmed Fraud Register", url: "/fraud-register", icon: BookCheck },
      { title: "Laporan Dugaan Fraud (CS Intake)", url: "/cs-intake", icon: Megaphone },
      { title: "Whistleblowing System", url: "/whistleblowing", icon: Siren },
      { title: "User Intelligence", url: "/users", icon: Users },
      { title: "Cyber Security", url: "/cyber-security", icon: Lock },
      { title: "Fraud Loss Ratio", url: "/loss-ratio", icon: TrendingDown },
      { title: "Regulatory Reporting (BI/OJK)", url: "/regulatory", icon: FileText },
      { title: "Audit Trail", url: "/audit", icon: ScrollText },
    ],
  },
  {
    label: "Operasional & Pendukung",
    items: [
      { title: "Rule Management", url: "/rules", icon: Sliders },
      { title: "Risk Scoring Engine", url: "/scoring", icon: Calculator },
      { title: "Parameter Configurator", url: "/parameters", icon: Sliders },
      { title: "Blacklist Management", url: "/blacklist", icon: Ban },
      { title: "Merchant Intelligence", url: "/merchants", icon: Store },
      { title: "e-KYC Fraud Monitor", url: "/ekyc", icon: UserCheck },
      { title: "Fraud Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Operational Risk", url: "/operational-risk", icon: Activity },
      { title: "Consumer Protection", url: "/consumer-protection", icon: HeartHandshake },
      { title: "Risk Management", url: "/risk-management", icon: GaugeCircle },
      { title: "Complaint Ratio", url: "/complaint-ratio", icon: MessageSquareWarning },
      { title: "Administration", url: "/administration", icon: Settings },
      { title: "Account Management", url: "/account-management", icon: KeyRound },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const users = useAppStore((s) => s.users);
  const currentUser = session ? users.find((u) => u.id === session.userId) ?? null : null;

  const initials = currentUser?.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  function handleLogout() {
    logout();
    toast.success("Anda telah keluar");
    navigate({ to: "/login", replace: true });
  }

  const filteredGroups = currentUser
    ? groups
        .map((g) => ({
          ...g,
          items: g.items.filter((it) => canAccess(currentUser.role, it.url)),
        }))
        .filter((g) => g.items.length > 0)
    : [];

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
        {filteredGroups.map((g, i) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel
              className={
                i === 0
                  ? "mb-1 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                  : "text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50"
              }
            >
              {i === 0 && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              )}
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-sidebar-accent">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                  {initials}
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-medium text-sidebar-foreground">{currentUser.name}</span>
                  <span className="text-[10px] text-sidebar-foreground/60">
                    {ROLE_LABEL[currentUser.role]} · GMT+7
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-[10px] text-muted-foreground">{currentUser.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <UserIcon className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              {canAccess(currentUser.role, "/account-management") && (
                <DropdownMenuItem onClick={() => navigate({ to: "/account-management" })}>
                  <KeyRound className="h-4 w-4" /> Account Management
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
