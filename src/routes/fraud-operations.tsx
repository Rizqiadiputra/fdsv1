import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert, Activity, Clock, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SeverityBadge } from "@/components/severity-badge";
import { alerts, fmtIDR, type Alert } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fraud-operations")({
  head: () => ({
    meta: [
      { title: "Fraud Operations — Sentinel EFRMP" },
      { name: "description", content: "Real-time fraud alert center and triage workspace." },
    ],
  }),
  component: FraudOps,
});

function FraudOps() {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Alert | null>(null);
  const [lastPoll, setLastPoll] = useState<string>(new Date().toLocaleTimeString("id-ID"));
  const [, setTick] = useState(0);

  useEffect(() => {
    // Polling refresh (bukan websocket) tiap 5 detik.
    const t = setInterval(() => {
      setTick((n) => n + 1);
      setLastPoll(new Date().toLocaleTimeString("id-ID"));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = alerts.filter((a) =>
    tab === "all" ? true : a.severity.toLowerCase() === tab,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fraud Operations Center"
        description="Real-time alert triage, queue management, and analyst workflow."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
            </Button>
            <Button size="sm">Bulk Assign</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Alerts Today" value="1,284" delta={8.2} icon={<ShieldAlert className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Critical Open" value="42" delta={14.5} icon={<AlertTriangle className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Avg Triage Time" value="3m 42s" delta={-6.1} icon={<Clock className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Analyst Online" value="18 / 24" hint="6 idle" icon={<Activity className="h-4 w-4" />} tone="info" />
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Live Alert Queue</CardTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-xs text-info">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info" />
              polling · last {lastPoll}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search alert ID, user, rule…" className="h-8 w-[260px]" />
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="topup">TopUp</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="critical" className="text-xs">Critical</TabsTrigger>
                <TabsTrigger value="high" className="text-xs">High</TabsTrigger>
                <TabsTrigger value="medium" className="text-xs">Medium</TabsTrigger>
                <TabsTrigger value="low" className="text-xs">Low</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[140px]">Alert ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[120px]">Risk</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Fraud Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelected(a)}
                  >
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.ts}</TableCell>
                    <TableCell className="font-mono text-xs">{a.user}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtIDR(a.amount)}</TableCell>
                    <TableCell>
                      <RiskBar score={a.score} />
                    </TableCell>
                    <TableCell className="text-xs">{a.rule}</TableCell>
                    <TableCell className="text-xs">{a.fraudType}</TableCell>
                    <TableCell><SeverityBadge value={a.severity} /></TableCell>
                    <TableCell><SeverityBadge value={a.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent>
          {selected && (
            <div className="mx-auto w-full max-w-4xl p-6">
              <DrawerHeader className="px-0">
                <DrawerTitle className="flex items-center gap-2">
                  <span className="font-mono text-base">{selected.id}</span>
                  <SeverityBadge value={selected.severity} />
                  <SeverityBadge value={selected.status} />
                </DrawerTitle>
                <DrawerDescription>{selected.rule}</DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-4 md:grid-cols-3">
                <Info label="User">{selected.user}</Info>
                <Info label="Amount">{fmtIDR(selected.amount)}</Info>
                <Info label="Risk Score">{selected.score} / 100</Info>
                <Info label="Fraud Type">{selected.fraudType}</Info>
                <Info label="Timestamp">{selected.ts}</Info>
                <Info label="Channel">QRIS</Info>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button>Approve</Button>
                <Button variant="destructive">Reject</Button>
                <Button variant="outline">Assign</Button>
                <Button variant="outline">Escalate</Button>
                <Button variant="ghost">Open Case</Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm text-foreground">{children}</p>
    </div>
  );
}

function RiskBar({ score }: { score: number }) {
  const tone =
    score >= 81 ? "bg-critical" : score >= 61 ? "bg-destructive" : score >= 31 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", tone)} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs text-foreground">{score}</span>
    </div>
  );
}
