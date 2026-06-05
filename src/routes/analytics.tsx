import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { TrendingDown, AlertTriangle, Percent, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fraudTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Fraud Analytics — Sentinel EFRMP" }] }),
  component: AnalyticsPage,
});

const channelData = [
  { name: "QRIS", fraud: 312, loss: 4200 },
  { name: "Transfer", fraud: 268, loss: 5840 },
  { name: "TopUp", fraud: 184, loss: 2100 },
  { name: "Bill Pay", fraud: 94, loss: 1320 },
  { name: "Merchant", fraud: 142, loss: 3680 },
  { name: "Intl.", fraud: 78, loss: 2980 },
];

const regionData = [
  { name: "DKI Jakarta", fraud: 412, loss: 6800 },
  { name: "Jawa Barat", fraud: 318, loss: 4200 },
  { name: "Jawa Timur", fraud: 268, loss: 3500 },
  { name: "Banten", fraud: 184, loss: 2400 },
  { name: "Sumatera Utara", fraud: 142, loss: 1900 },
  { name: "Bali", fraud: 94, loss: 1200 },
  { name: "Sulawesi Selatan", fraud: 78, loss: 980 },
];

function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Fraud Analytics"
        description="Deep analytics across time, geography, channels, and merchants — for risk officers and managers."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Fraud Rate" value="0.018%" delta={-2.1} icon={<TrendingDown className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Loss Rate" value="0.0067%" delta={-4.4} icon={<AlertTriangle className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="False Positive Rate" value="11.4%" delta={-1.2} icon={<Percent className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Investigation SLA" value="94.2%" delta={1.8} hint="met" icon={<Clock className="h-4 w-4" />} tone="success" />
      </div>

      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Time Trend</TabsTrigger>
          <TabsTrigger value="channel">Channel</TabsTrigger>
          <TabsTrigger value="region">Region</TabsTrigger>
          <TabsTrigger value="merchant">Merchant</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <div className="grid gap-4 lg:grid-cols-3">
            {[["Daily", "fraud"], ["Weekly", "loss"], ["Monthly", "complaints"]].map(([label, key]) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{label} Fraud Trend</CardTitle>
                  <CardDescription>Rolling 12-period view</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={fraudTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey={key} stroke="var(--color-chart-1)" fill={`url(#g-${key})`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channel">
          <Card>
            <CardHeader><CardTitle className="text-base">Fraud by Channel</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="fraud" name="Fraud Cases" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loss" name="Loss (Rp M)" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="region">
          <Card>
            <CardHeader><CardTitle className="text-base">Fraud by Region</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={regionData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} width={120} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="fraud" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="loss" fill="var(--color-chart-4)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchant">
          <Card>
            <CardHeader><CardTitle className="text-base">Top Merchants by Fraud Volume</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const v = 100 - i * 9;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-20 font-mono text-xs">MCH-{33012 + i}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-to-r from-chart-1 to-chart-5" style={{ width: `${v}%`, background: "linear-gradient(90deg, var(--color-chart-1), var(--color-chart-5))" }} />
                    </div>
                    <span className="w-16 text-right font-mono text-xs">{180 - i * 16}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
