import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Folder, FileCheck2, AlertTriangle, Timer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge } from "@/components/severity-badge";
import { cases, fmtIDR } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [{ title: "Case Management — Sentinel EFRMP" }],
  }),
  component: CaseMgmt,
});

const statuses = ["Open", "Assigned", "Investigation", "Escalated", "Fraud Confirmed", "False Positive", "Closed"];

function CaseMgmt() {
  const [active, setActive] = useState<typeof cases[number] | null>(null);
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? cases : cases.filter((c) => c.status === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Case Management"
        description="Full investigation workflow from assignment to closure, with evidence and audit-ready timeline."
        actions={<Button size="sm">+ New Case</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Open Cases" value="312" delta={-3.8} icon={<Folder className="h-4 w-4" />} tone="info" invertDelta />
        <KpiCard label="Fraud Confirmed (MTD)" value="148" delta={-8.5} icon={<AlertTriangle className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="False Positive Rate" value="11.4%" delta={-1.8} icon={<FileCheck2 className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Avg Closure Time" value="2.4 d" delta={-12.0} icon={<Timer className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-8 flex-wrap">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {statuses.map((s) => (
                <TabsTrigger key={s} value={s} className="text-xs">{s}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Case ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Fraud Type</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                  <TableHead className="text-right">Recovered</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Wallet/Rek. Pelaku</TableHead>
                  <TableHead>Divisi/Unit</TableHead>
                  <TableHead>Tindak Lanjut</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setActive(c)}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-mono text-xs">{c.user}</TableCell>
                    <TableCell className="text-xs">{c.type}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-destructive">{fmtIDR(c.lossAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-success">{c.recoveredAmount > 0 ? fmtIDR(c.recoveredAmount) : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.location}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{c.perpetratorAccount}</TableCell>
                    <TableCell className="text-xs">{c.division}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground" title={c.recommendation}>{c.recommendation}</TableCell>
                    <TableCell><SeverityBadge value={c.status} /></TableCell>
                    <TableCell className="text-xs">{c.assignee}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{c.age}</TableCell>
                    <TableCell><SeverityBadge value={c.sla} /></TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="h-7 text-xs">Open</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{active.id}</span>
                  <SeverityBadge value={active.status} />
                  <SeverityBadge value={active.sla} />
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tx">Transactions</TabsTrigger>
                  <TabsTrigger value="user">User & Device</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Info label="User">{active.user}</Info>
                    <Info label="Fraud Type">{active.type}</Info>
                    <Info label="Exposure">{fmtIDR(active.amount)}</Info>
                    <Info label="Assignee">{active.assignee}</Info>
                    <Info label="Age">{active.age} day(s)</Info>
                    <Info label="SLA">{active.sla}</Info>
                  </div>
                  <Separator />
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Investigation Notes</p>
                    <Textarea placeholder="Add note, attach evidence, request approval…" rows={4} />
                  </div>
                </TabsContent>
                <TabsContent value="tx" className="pt-3 text-sm text-muted-foreground">
                  Linked transactions: TX-90012, TX-90187, TX-90299. Cluster amount: {fmtIDR(active.amount)}.
                </TabsContent>
                <TabsContent value="user" className="pt-3 text-sm text-muted-foreground">
                  KYC Tier 2 · Device DEV-70241 (Android 14) · IP 103.45.18.7 (Jakarta).
                </TabsContent>
                <TabsContent value="evidence" className="pt-3 text-sm text-muted-foreground">
                  3 attachments · 1 chat transcript · 2 screenshots.
                </TabsContent>
                <TabsContent value="timeline" className="pt-3">
                  <ol className="relative space-y-3 border-l border-border pl-4 text-xs">
                    {[
                      ["10:02", "Alert raised by R-1042"],
                      ["10:05", "Auto-assigned to Andini P."],
                      ["10:18", "User contacted — no response"],
                      ["11:30", "Escalated to Fraud Manager"],
                      ["12:11", "Device DEV-70241 blacklisted"],
                    ].map(([t, d]) => (
                      <li key={t} className="relative">
                        <span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <span className="font-mono text-muted-foreground">{t}</span> — {d}
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button>Approve</Button>
                <Button variant="destructive">Confirm Fraud</Button>
                <Button variant="outline">Escalate</Button>
                <Button variant="outline">Blacklist User</Button>
                <Button variant="outline">Blacklist Device</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-foreground">{children}</p>
    </div>
  );
}
