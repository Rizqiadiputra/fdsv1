import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sliders, Plus, Play, Code2, Library, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/severity-badge";
import { toast } from "sonner";
import { rulesList } from "@/lib/mock-data";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Rule Management — Sentinel EFRMP" }] }),
  component: RulesPage,
});

const SUMSCRIPT_SAMPLE = `// Sumscript — new rule
rule "New Device + High Cash Out" {
  when amount > 5000000
    and device.isNew
    and account.ageDays < 7
    and network.vpn == true
  then hold(score: +35)
}`;

const SUMSUB_LIBRARY = [
  { id: "SS-VEL-01", name: "Velocity — multiple QRIS", sev: "High", desc: "≥ N QRIS payments within rolling window." },
  { id: "SS-MULE-02", name: "Money mule pattern", sev: "Critical", desc: "Fan-in/fan-out transfer structure." },
  { id: "SS-SIM-03", name: "SIM swap indicator", sev: "High", desc: "Device + SIM change before cash out." },
  {
    id: "SS-ATO-04",
    name: "Account takeover signal",
    sev: "Critical",
    desc: "New device + credential reset + payout.",
  },
  { id: "SS-PROMO-05", name: "Promo abuse burst", sev: "Medium", desc: "Repeated promo redemptions per device." },
  { id: "SS-STRUCT-06", name: "Structuring / smurfing", sev: "High", desc: "Multiple sub-threshold transfers." },
];

function RulesPage() {
  const [libOpen, setLibOpen] = useState(false);
  const [script, setScript] = useState(SUMSCRIPT_SAMPLE);
  const [installed, setInstalled] = useState<string[]>([]);

  const validateScript = () => {
    const ok = /rule\s+".+"\s*\{[\s\S]*when[\s\S]*then[\s\S]*\}/.test(script);
    if (ok) toast.success("Sumscript valid");
    else toast.error('Sumscript invalid — expected: rule "..." { when ... then ... }');
  };
  const install = (id: string, name: string) => {
    if (installed.includes(id)) {
      toast(`${name} already installed`);
      return;
    }
    setInstalled((p) => [...p, id]);
    toast.success(`Installed: ${name}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rule Management"
        description="Create, version, simulate, and govern detection rules."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setLibOpen(true)}>
              <Library className="mr-1.5 h-3.5 w-3.5" /> Install from Sumsub
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast("Simulator started (mock)")}>
              <Play className="mr-1.5 h-3.5 w-3.5" /> Simulator
            </Button>
            <Button size="sm" onClick={() => toast.success("New rule draft created")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Rule
            </Button>
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
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
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
                    <TableCell>
                      <SeverityBadge value={r.severity} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {r.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge value={r.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.version}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.hits}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toast(`Editing ${r.id}`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
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
            <CardDescription>Visual composer or Sumscript</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visual">
              <TabsList className="mb-3">
                <TabsTrigger value="visual">
                  <Sliders className="mr-1 h-3.5 w-3.5" /> Visual
                </TabsTrigger>
                <TabsTrigger value="sumscript">
                  <Code2 className="mr-1 h-3.5 w-3.5" /> Sumscript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-3">
                <Condition kw="IF" text="Transaction Amount" op=">" val="Rp 5,000,000" />
                <Condition kw="AND" text="Device" op="=" val="New" />
                <Condition kw="AND" text="Account Age" op="<" val="7 days" />
                <Condition kw="AND" text="VPN" op="=" val="True" />
                <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">THEN</div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Action:</span> Hold for Review ·{" "}
                    <span className="font-medium">Score:</span> +35
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={() => toast.success("Draft saved")}>
                    Save Draft
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast("Simulating rule…")}>
                    Simulate
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sumscript" className="space-y-3">
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={12}
                  spellCheck={false}
                  className="font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => toast.success("Sumscript rule saved")}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={validateScript}>
                    Validate
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sumsub rule library */}
      <Dialog open={libOpen} onOpenChange={setLibOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Install rules from Sumsub library</DialogTitle>
            <DialogDescription>
              Built-in detection rules maintained by Sumsub. Install into your repository.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {SUMSUB_LIBRARY.map((t) => {
              const done = installed.includes(t.id);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{t.id}</span>
                      <SeverityBadge value={t.sev} />
                    </div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    disabled={done}
                    onClick={() => install(t.id, t.name)}
                  >
                    {done ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Installed
                      </>
                    ) : (
                      "Install"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLibOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
