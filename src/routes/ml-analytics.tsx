import { createFileRoute } from "@tanstack/react-router";
import { Brain, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mlModels, anomalyAlerts } from "@/lib/mock-data";

export const Route = createFileRoute("/ml-analytics")({
  head: () => ({ meta: [{ title: "ML Analytics — Sentinel EFRMP" }] }),
  component: MLPage,
});

const behavior = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  user: 50 + Math.sin(i / 3) * 18 + Math.random() * 8,
  device: 30 + Math.cos(i / 4) * 12 + Math.random() * 5,
  tx: 40 + Math.sin(i / 2) * 22 + Math.random() * 7,
}));

const radarData = mlModels.map((m) => ({
  model: m.name.split(" ")[0],
  Accuracy: m.accuracy * 100,
  Precision: m.precision * 100,
  Recall: m.recall * 100,
  F1: m.f1 * 100,
}));

function MLPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Machine Learning Analytics"
        description="Behavioral, device, and transaction anomaly detection driven by production ML models."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Behavioral Anomaly Score</CardTitle>
            <CardDescription>Composite scores for user, device, and transaction behavior · last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={behavior} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="user" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="device" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tx" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4" /> Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="model" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Accuracy" dataKey="Accuracy" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.3} />
                <Radar name="F1" dataKey="F1" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Model Metrics</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1</TableHead>
                <TableHead className="text-right">FPR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mlModels.map((m) => (
                <TableRow key={m.name} className="hover:bg-muted/40">
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(m.accuracy * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(m.precision * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(m.recall * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(m.f1 * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(m.fpr * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Anomaly Alerts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Anomaly ID</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalyAlerts.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-mono text-xs">{a.entity}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{a.type}</Badge></TableCell>
                  <TableCell className="text-xs">{a.model}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-destructive">{a.score}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.ts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
