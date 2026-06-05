import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Folder,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fraudTrend, fraudTypes, incidentTrend, fmtNum } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Sentinel EFRMP" },
      {
        name: "description",
        content:
          "Executive view of fraud, operational risk, cyber security, and consumer protection across the platform.",
      },
    ],
  }),
  component: ExecutiveDashboard,
});

function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Indonesian E-Wallet fraud, risk & resilience — aligned to Bank Indonesia PSP and OJK Consumer Protection requirements."
        actions={
          <>
            <Select defaultValue="30d">
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="qtd">Quarter to date</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">Board Pack</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Transactions" value={fmtNum(48923741)} delta={4.2} hint="vs prev. period" icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Transaction Value" value="Rp 14.2 T" delta={6.1} hint="this month" icon={<CircleDollarSign className="h-4 w-4" />} tone="info" />
        <KpiCard label="Active Alerts" value="2,418" delta={12.4} hint="open queue" icon={<ShieldAlert className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Active Cases" value="312" delta={-3.8} icon={<Folder className="h-4 w-4" />} tone="info" invertDelta />
        <KpiCard label="Confirmed Fraud" value="148" delta={-8.5} icon={<AlertTriangle className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Fraud Loss" value="Rp 2.4 B" delta={-14.2} icon={<Banknote className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Recovered" value="Rp 1.1 B" delta={9.6} hint="45.8% recovery" icon={<TrendingUp className="h-4 w-4" />} tone="success" />
        <KpiCard label="Fraud Rate" value="0.018%" delta={-2.1} icon={<TrendingDown className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Complaint Ratio" value="0.042%" delta={1.4} icon={<Users className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Cyber Incidents" value="34" delta={18.0} icon={<Cpu className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="System Availability" value="99.984%" delta={0.02} icon={<Activity className="h-4 w-4" />} tone="success" />
        <KpiCard label="Tx Success Rate" value="99.42%" delta={0.18} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Fraud & Loss Trend</CardTitle>
              <CardDescription>Confirmed fraud cases vs. financial loss, last 12 months</CardDescription>
            </div>
            <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
              <ShieldCheck className="mr-1 h-3 w-3" /> Within risk appetite
            </Badge>
          </CardHeader>
          <CardContent>
            <ChartFraudLoss />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fraud Type Distribution</CardTitle>
            <CardDescription>Confirmed cases by typology</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartFraudTypes />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Complaint Trend</CardTitle>
            <CardDescription>Consumer protection volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartLine dataKey="complaints" color="var(--color-chart-4)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operational & Cyber Incidents</CardTitle>
            <CardDescription>Weekly count, last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartIncidents />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Channel Risk Heat</CardTitle>
            <CardDescription>Risk-weighted alerts by channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { name: "QRIS", v: 86, tone: "bg-destructive" },
              { name: "Transfer", v: 64, tone: "bg-warning" },
              { name: "E-Wallet TopUp", v: 52, tone: "bg-warning" },
              { name: "Bill Payment", v: 31, tone: "bg-info" },
              { name: "Merchant Payout", v: 22, tone: "bg-success" },
              { name: "International", v: 78, tone: "bg-destructive" },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="font-mono text-muted-foreground">{c.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${c.tone}`} style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartFraudLoss() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={fraudTrend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gFraud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-5)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-5)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="fraud" name="Confirmed Fraud" stroke="var(--color-chart-1)" fill="url(#gFraud)" strokeWidth={2} />
        <Area type="monotone" dataKey="loss" name="Loss (Rp M)" stroke="var(--color-chart-5)" fill="url(#gLoss)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartFraudTypes() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={fraudTypes} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {fraudTypes.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 10 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ChartLine({ dataKey, color }: { dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={fraudTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartIncidents() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={incidentTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="operational" name="Operational" fill="var(--color-chart-4)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="cyber" name="Cyber" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
