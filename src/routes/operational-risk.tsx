import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { Activity, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge } from "@/components/severity-badge";

export const Route = createFileRoute("/operational-risk")({
  head: () => ({ meta: [{ title: "Operational Risk — Sentinel EFRMP" }] }),
  component: OpRiskPage,
});

const availability = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  uptime: 99.9 + Math.sin(i / 3) * 0.08,
  fails: Math.floor(40 + Math.abs(Math.sin(i / 2)) * 80),
}));

const incidents = [
  { id: "OPI-7012", type: "System Failure", system: "Core Switch", severity: "Critical", status: "Resolved", ts: "2025-06-04 14:22" },
  { id: "OPI-7011", type: "Transaction Failure", system: "QRIS Gateway", severity: "High", status: "In Progress", ts: "2025-06-05 09:18" },
  { id: "OPI-7010", type: "Service Degradation", system: "E-Wallet API", severity: "Medium", status: "Resolved", ts: "2025-06-03 22:40" },
  { id: "OPI-7009", type: "Infrastructure", system: "DB Replica", severity: "High", status: "Triage", ts: "2025-06-05 06:55" },
  { id: "OPI-7008", type: "Service Degradation", system: "Notif Service", severity: "Low", status: "Resolved", ts: "2025-06-02 11:30" },
];

function OpRiskPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational Risk Monitoring"
        description="System availability, transaction throughput, and operational incident pipeline."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="Availability" value="99.984%" delta={0.02} icon={<Activity className="h-4 w-4" />} tone="success" />
        <KpiCard label="Tx Success" value="99.42%" delta={0.18} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <KpiCard label="Avg Latency" value="284 ms" delta={-3.4} icon={<Zap className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Service Outages" value="3" hint="last 30d" icon={<AlertCircle className="h-4 w-4" />} tone="warning" />
        <KpiCard label="Failed Tx (24h)" value="18,402" delta={-5.6} icon={<AlertCircle className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Availability — Last 24 Hours</CardTitle>
            <CardDescription>Rolling uptime, target ≥ 99.95%</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={availability} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="up" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[99.7, 100]} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="uptime" stroke="var(--color-success)" fill="url(#up)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Failed Transactions</CardTitle>
            <CardDescription>Hourly fail count, last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={availability} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="fails" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SLA Compliance & Operational Incidents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Incident</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((i) => (
                <TableRow key={i.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="text-xs">{i.type}</TableCell>
                  <TableCell className="text-xs">{i.system}</TableCell>
                  <TableCell><SeverityBadge value={i.severity} /></TableCell>
                  <TableCell><SeverityBadge value={i.status} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{i.ts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
