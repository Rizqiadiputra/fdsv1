import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, Banknote, TrendingUp, Target } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { lossRatioTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/loss-ratio")({
  head: () => ({
    meta: [
      { title: "Fraud Loss Ratio Monitoring — Sentinel EFRMP" },
      { name: "description", content: "Fraud loss as a ratio of GMV, monitored against BI/OJK risk appetite." },
    ],
  }),
  component: LossRatio,
});

function LossRatio() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Fraud Loss Ratio Monitoring"
        description="Loss in basis points (bps) against GMV — aligned to risk appetite communicated to BI & OJK."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="YTD Loss" value="Rp 184.6 B" delta={-6.4} icon={<Banknote className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Loss Ratio (bps)" value="1.42" delta={-0.12} hint="vs target 2.00" icon={<TrendingDown className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Recovered" value="Rp 78.4 B" delta={9.8} hint="YTD" icon={<TrendingUp className="h-4 w-4" />} tone="success" />
        <KpiCard label="Recovery Rate (%)" value="42.5%" delta={3.4} hint="Recovered ÷ Loss (YTD)" icon={<TrendingUp className="h-4 w-4" />} tone="success" />
        <KpiCard label="Risk Appetite" value="≤ 2.00 bps" hint="approved by RMC" icon={<Target className="h-4 w-4" />} tone="info" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Loss Ratio vs Target (12 months)</CardTitle>
          <CardDescription>Monthly GMV (Rp B) and Loss Ratio (bps)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={lossRatioTrend} margin={{ top: 10, right: 8, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis yAxisId="l" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="gmv" name="GMV (Rp B)" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="loss" name="Loss (bps)" stroke="var(--color-chart-5)" strokeWidth={2} dot={{ r: 3 }} />
              <ReferenceLine yAxisId="r" y={2.0} stroke="var(--color-warning)" strokeDasharray="4 4" label={{ value: "Target", fill: "var(--color-warning)", fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Loss by Fraud Type</CardTitle>
            <CardDescription>YTD Rp loss attribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { k: "Account Takeover", v: 78, l: "Rp 72.4 B" },
              { k: "Money Mule", v: 64, l: "Rp 59.1 B" },
              { k: "QRIS Fraud", v: 48, l: "Rp 44.3 B" },
              { k: "Promo Abuse", v: 34, l: "Rp 31.2 B" },
              { k: "Merchant Fraud", v: 28, l: "Rp 25.8 B" },
              { k: "Synthetic ID", v: 18, l: "Rp 16.6 B" },
            ].map((c) => (
              <div key={c.k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{c.k}</span><span className="font-mono text-muted-foreground">{c.l}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-destructive/70" style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Loss by Channel</CardTitle>
            <CardDescription>YTD share of total loss</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              { k: "QRIS Payment", v: 38, l: "38%" },
              { k: "P2P Transfer", v: 28, l: "28%" },
              { k: "Cash Out", v: 18, l: "18%" },
              { k: "TopUp", v: 9, l: "9%" },
              { k: "Bill Payment", v: 7, l: "7%" },
            ].map((c) => (
              <div key={c.k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{c.k}</span><span className="font-mono text-muted-foreground">{c.l}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-warning/80" style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
