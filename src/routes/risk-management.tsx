import { createFileRoute } from "@tanstack/react-router";
import { GaugeCircle, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge } from "@/components/severity-badge";
import { riskRegister } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk-management")({
  head: () => ({ meta: [{ title: "Risk Management — Sentinel EFRMP" }] }),
  component: RiskMgmtPage,
});

const appetite = [
  { name: "Fraud Rate", actual: 0.018, threshold: 0.05, unit: "%", state: "OK" },
  { name: "Complaint Ratio", actual: 0.042, threshold: 0.05, unit: "%", state: "Watch" },
  { name: "Availability", actual: 99.984, threshold: 99.95, unit: "%", state: "OK", invert: true },
  { name: "Cyber Incidents (Critical)", actual: 4, threshold: 3, unit: "", state: "Breach" },
  { name: "Loss / Tx Value", actual: 0.0067, threshold: 0.01, unit: "%", state: "OK" },
  { name: "SLA Compliance", actual: 94.2, threshold: 95, unit: "%", state: "Watch", invert: true },
];

function RiskMgmtPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Risk Management"
        description="Enterprise risk register and risk appetite monitoring vs. board-approved thresholds."
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Appetite Dashboard</CardTitle>
          <CardDescription>Actual vs. Threshold · Board-approved (2025)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {appetite.map((a) => {
              const pct = Math.min(100, (a.actual / a.threshold) * 100);
              const tone =
                a.state === "Breach" ? "bg-critical" :
                a.state === "Watch" ? "bg-warning" : "bg-success";
              const badgeTone =
                a.state === "Breach" ? "Critical" :
                a.state === "Watch" ? "Medium" : "Active";
              return (
                <div key={a.name} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{a.name}</span>
                    <SeverityBadge value={badgeTone} />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-semibold text-foreground">
                      {a.actual}{a.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / threshold {a.threshold}{a.unit}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
                    <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enterprise Risk Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Risk ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Mitigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskRegister.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs">{r.title}</TableCell>
                  <TableCell className="text-xs">{r.category}</TableCell>
                  <TableCell><SeverityBadge value={r.level} /></TableCell>
                  <TableCell className="text-xs">{r.owner}</TableCell>
                  <TableCell><SeverityBadge value={r.mitigation} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
