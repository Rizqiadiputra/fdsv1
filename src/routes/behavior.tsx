import { createFileRoute } from "@tanstack/react-router";
import { Activity, TrendingUp, AlertTriangle, Fingerprint } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { behaviorMetrics, users, fmtIDR } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/behavior")({
  head: () => ({
    meta: [
      { title: "Account Behavior Analytics — Sentinel EFRMP" },
      { name: "description", content: "Behavioral biometrics and anomaly detection per e-wallet account." },
    ],
  }),
  component: Behavior,
});

function Behavior() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Account Behavior Analytics"
        description="Behavioral baselining, anomaly detection, and behavioral biometrics across the user base."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Profiled Accounts" value="4.82 M" delta={3.1} icon={<Fingerprint className="h-4 w-4" />} tone="info" />
        <KpiCard label="Behavior Anomalies (24h)" value="218" delta={12.4} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="High-Risk Sessions" value="64" delta={-8.6} icon={<Activity className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Behavior Match Score" value="94.8%" delta={0.4} icon={<TrendingUp className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hourly Transaction Pattern vs Anomalies</CardTitle>
            <CardDescription>Aggregated across all e-wallet accounts (WIB)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={behaviorMetrics} margin={{ top: 10, right: 8, left: -10 }}>
                <defs>
                  <linearGradient id="bTxn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="txn" name="Transactions" stroke="var(--color-chart-2)" fill="url(#bTxn)" strokeWidth={2} />
                <Area type="monotone" dataKey="anomaly" name="Anomalies" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Behavioral Indicators</CardTitle>
            <CardDescription>Triggers seen in last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={[
                { k: "Velocity Spike", v: 124 },
                { k: "New Device", v: 98 },
                { k: "Geo Anomaly", v: 86 },
                { k: "Time Anomaly", v: 71 },
                { k: "Amount Pattern", v: 63 },
                { k: "Beneficiary Reuse", v: 52 },
              ]} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="k" stroke="var(--color-muted-foreground)" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--color-chart-4)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">High-Risk Behavioral Profiles</CardTitle>
          <CardDescription>Accounts deviating from learned baseline</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>User</TableHead>
                <TableHead>KYC Tier</TableHead>
                <TableHead>Behavior Score</TableHead>
                <TableHead>Indicators</TableHead>
                <TableHead className="text-right">Avg Tx (30d)</TableHead>
                <TableHead className="text-right">Alerts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 10).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{u.kyc}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{u.score}</TableCell>
                  <TableCell className="space-x-1">
                    {u.indicators.map((i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>
                    ))}
                    {u.indicators.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmtIDR(u.tx * 1500)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{u.alerts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
