import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scoring")({
  head: () => ({ meta: [{ title: "Risk Scoring Engine — Sentinel EFRMP" }] }),
  component: ScoringPage,
});

const components = [
  { name: "New Device", weight: 18, max: 25 },
  { name: "VPN Usage", weight: 12, max: 15 },
  { name: "Velocity Anomaly", weight: 16, max: 20 },
  { name: "Cash Out Pattern", weight: 14, max: 20 },
  { name: "Fraud History", weight: 9, max: 20 },
];

const total = components.reduce((s, c) => s + c.weight, 0);
const decision =
  total >= 81 ? { label: "Reject", tone: "bg-critical text-critical-foreground" } :
  total >= 61 ? { label: "Hold", tone: "bg-destructive text-destructive-foreground" } :
  total >= 31 ? { label: "Review", tone: "bg-warning text-warning-foreground" } :
  { label: "Approve", tone: "bg-success text-success-foreground" };

function ScoringPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Risk Scoring Engine"
        description="Transparent, explainable scoring composed from behavioral, device, and historical signals."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" /> Score Breakdown · USR-40512</CardTitle>
            <CardDescription>Live decomposition of the latest transaction risk score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {components.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-mono text-muted-foreground">+{c.weight} / {c.max}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gradient-to-r from-info to-destructive" style={{ width: `${(c.weight / c.max) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Composite Score</div>
                  <div className="mt-1 font-mono text-4xl font-bold text-foreground">{total}<span className="text-base text-muted-foreground"> / 100</span></div>
                </div>
                <Badge className={cn("px-3 py-1.5 text-sm", decision.tone)}>{decision.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Decision Matrix</CardTitle>
            <CardDescription>Score-to-action mapping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { range: "0 – 30", label: "Approve", tone: "border-success/40 bg-success/10 text-success" },
              { range: "31 – 60", label: "Review", tone: "border-warning/40 bg-warning/10 text-warning" },
              { range: "61 – 80", label: "Hold", tone: "border-destructive/40 bg-destructive/10 text-destructive" },
              { range: "81 – 100", label: "Reject", tone: "border-critical/40 bg-critical/15 text-critical" },
            ].map((d) => (
              <div key={d.range} className={cn("flex items-center justify-between rounded-md border p-3", d.tone)}>
                <span className="font-mono text-sm font-medium">{d.range}</span>
                <span className="text-sm font-semibold">{d.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
