import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareWarning, Target, Clock, CheckCircle2 } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { complaintRatioTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/complaint-ratio")({
  head: () => ({
    meta: [
      { title: "Complaint Ratio Monitoring — Sentinel EFRMP" },
      { name: "description", content: "Consumer complaint ratio per OJK Consumer Protection requirements." },
    ],
  }),
  component: ComplaintRatio,
});

function ComplaintRatio() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Complaint Ratio Monitoring"
        description="OJK Consumer Protection KPI — complaints per 1,000 transactions, with SLA and resolution rate."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Complaint Ratio" value="0.037‰" delta={-0.002} hint="vs OJK target 0.050‰" icon={<MessageSquareWarning className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="OJK Threshold" value="0.050‰" icon={<Target className="h-4 w-4" />} tone="info" />
        <KpiCard label="SLA Compliance" value="96.4%" delta={1.2} hint="48h response" icon={<Clock className="h-4 w-4" />} tone="success" />
        <KpiCard label="Resolution Rate" value="92.8%" delta={0.6} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Complaint Ratio Trend (12 months)</CardTitle>
          <CardDescription>Per OJK POJK 6/2022 Consumer Protection reporting</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={complaintRatioTrend} margin={{ top: 10, right: 8, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis yAxisId="l" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="tx" name="Tx Volume (M)" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="complaints" name="Complaint Ratio (‰)" stroke="var(--color-chart-5)" strokeWidth={2} dot={{ r: 3 }} />
              <ReferenceLine yAxisId="r" y={0.05} stroke="var(--color-destructive)" strokeDasharray="4 4" label={{ value: "OJK Target", fill: "var(--color-destructive)", fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { k: "Unauthorized Transaction", v: 42, n: 1284 },
              { k: "Failed Transaction", v: 28, n: 856 },
              { k: "Refund Issue", v: 14, n: 428 },
              { k: "Service Quality", v: 10, n: 305 },
              { k: "Fraud Claim", v: 6, n: 184 },
            ].map((c) => (
              <div key={c.k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{c.k}</span><span className="font-mono text-muted-foreground">{c.n}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-warning/80" style={{ width: `${c.v * 2}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA Aging</CardTitle>
            <CardDescription>Open complaints by age</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { k: "0–24h", v: 60, n: 184, t: "bg-success" },
              { k: "24–48h", v: 30, n: 92, t: "bg-info" },
              { k: "48–72h", v: 8, n: 24, t: "bg-warning" },
              { k: ">72h (Breach)", v: 2, n: 6, t: "bg-destructive" },
            ].map((c) => (
              <div key={c.k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{c.k}</span><span className="font-mono text-muted-foreground">{c.n}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${c.t}`} style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
