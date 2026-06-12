import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { ShieldX, ShieldAlert, Activity, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { cyberIncidents, vaPentestTracker } from "@/lib/mock-data";

export const Route = createFileRoute("/cyber-security")({
  head: () => ({ meta: [{ title: "Cyber Security — Sentinel EFRMP" }] }),
  component: CyberPage,
});

const trend = Array.from({ length: 14 }).map((_, i) => ({
  d: `D${i + 1}`,
  total: Math.floor(8 + Math.abs(Math.sin(i / 1.5)) * 18),
}));

const severity = [
  { name: "Critical", value: 4, color: "var(--color-critical)" },
  { name: "High", value: 11, color: "var(--color-destructive)" },
  { name: "Medium", value: 14, color: "var(--color-warning)" },
  { name: "Low", value: 5, color: "var(--color-info)" },
];

const threats = [
  { name: "Brute Force", value: 42 },
  { name: "Credential Stuff.", value: 38 },
  { name: "DDoS", value: 18 },
  { name: "Malware", value: 12 },
  { name: "Unauth Access", value: 9 },
  { name: "Data Leakage", value: 5 },
];

function CyberPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Cyber Security Operations"
        description="SOC-style visibility into threats, incidents, and defensive posture."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Open Incidents" value="14" delta={12.5} icon={<ShieldAlert className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Critical" value="4" delta={1.0} icon={<ShieldX className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Resolved (MTD)" value="62" delta={8.4} icon={<ShieldCheck className="h-4 w-4" />} tone="success" />
        <KpiCard label="MTTR" value="2.8 h" delta={-9.0} icon={<Activity className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Incident Trend</CardTitle>
            <CardDescription>Last 14 days, all severities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="var(--color-destructive)" fill="url(#cy)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severity} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {severity.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Threat Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={threats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cyber Incident Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Incident</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cyberIncidents.map((i) => (
                <TableRow key={i.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="text-xs">{i.type}</TableCell>
                  <TableCell><SeverityBadge value={i.severity} /></TableCell>
                  <TableCell><SeverityBadge value={i.status} /></TableCell>
                  <TableCell className="text-xs">{i.source}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{i.detected}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
