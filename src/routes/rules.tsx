import { createFileRoute } from "@tanstack/react-router";
import { Sliders, Plus, Play } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { rulesList } from "@/lib/mock-data";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Rule Management — Sentinel EFRMP" }] }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Rule Management"
        description="Create, version, simulate, and govern detection rules."
        actions={
          <>
            <Button variant="outline" size="sm"><Play className="mr-1.5 h-3.5 w-3.5" /> Simulator</Button>
            <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New Rule</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Rule Repository</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search rules…" className="h-8 w-[200px]" />
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Rule</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Hits (30d)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesList.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="font-mono text-xs">{r.id}</div>
                      <div className="text-xs font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                    </TableCell>
                    <TableCell><SeverityBadge value={r.severity} /></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.action}</Badge></TableCell>
                    <TableCell><SeverityBadge value={r.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.version}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.hits}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4" /> Rule Builder
            </CardTitle>
            <CardDescription>Visual IF / AND / THEN composer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Condition kw="IF" text="Transaction Amount" op=">" val="Rp 5,000,000" />
            <Condition kw="AND" text="Device" op="=" val="New" />
            <Condition kw="AND" text="Account Age" op="<" val="7 days" />
            <Condition kw="AND" text="VPN" op="=" val="True" />
            <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">THEN</div>
              <div className="mt-1 text-sm">
                <span className="font-medium">Action:</span> Hold for Review · <span className="font-medium">Score:</span> +35
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1">Save Draft</Button>
              <Button size="sm" variant="outline" className="flex-1">Simulate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Condition({ kw, text, op, val }: { kw: string; text: string; op: string; val: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kw}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        <span className="font-medium">{text}</span>
        <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">{op}</span>
        <span className="font-mono">{val}</span>
      </div>
    </div>
  );
}
