import { createFileRoute } from "@tanstack/react-router";
import { Network, GitBranch, Users, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/network")({
  head: () => ({ meta: [{ title: "Network Intelligence — Sentinel EFRMP" }] }),
  component: NetworkPage,
});

// Static graph layout — hand-tuned positions for a clean ring visualization
const nodes = [
  { id: "USR-40221", t: "user", x: 280, y: 80, size: 18 },
  { id: "USR-40512", t: "user", x: 460, y: 120, size: 22 },
  { id: "USR-40887", t: "user", x: 540, y: 280, size: 18 },
  { id: "USR-41204", t: "user", x: 420, y: 400, size: 20 },
  { id: "USR-41502", t: "user", x: 220, y: 380, size: 18 },
  { id: "USR-41789", t: "user", x: 140, y: 220, size: 18 },
  { id: "DEV-70241", t: "device", x: 360, y: 240, size: 26 },
  { id: "DEV-70312", t: "device", x: 200, y: 140, size: 18 },
  { id: "DEV-70498", t: "device", x: 500, y: 360, size: 18 },
  { id: "ACC-90012", t: "account", x: 620, y: 220, size: 18 },
  { id: "ACC-90187", t: "account", x: 320, y: 460, size: 18 },
  { id: "IP-103.45", t: "ip", x: 60, y: 320, size: 16 },
  { id: "MCH-33012", t: "merchant", x: 660, y: 100, size: 18 },
];

const edges: [string, string, "normal" | "alert"][] = [
  ["USR-40221", "DEV-70241", "alert"],
  ["USR-40512", "DEV-70241", "alert"],
  ["USR-40887", "DEV-70241", "alert"],
  ["USR-41204", "DEV-70241", "alert"],
  ["USR-41502", "DEV-70241", "normal"],
  ["USR-41789", "DEV-70312", "normal"],
  ["USR-40221", "DEV-70312", "normal"],
  ["USR-41204", "ACC-90187", "alert"],
  ["USR-40512", "ACC-90012", "alert"],
  ["DEV-70241", "ACC-90012", "alert"],
  ["DEV-70498", "USR-40887", "normal"],
  ["IP-103.45", "USR-41789", "normal"],
  ["IP-103.45", "USR-41502", "normal"],
  ["MCH-33012", "ACC-90012", "alert"],
];

const colorFor = (t: string) => {
  switch (t) {
    case "user": return "var(--color-chart-1)";
    case "device": return "var(--color-chart-2)";
    case "account": return "var(--color-chart-3)";
    case "ip": return "var(--color-chart-4)";
    case "merchant": return "var(--color-chart-5)";
    default: return "var(--color-primary)";
  }
};

function NetworkPage() {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="space-y-5">
      <PageHeader
        title="Network Intelligence"
        description="Graph analytics for fraud rings, mule networks, and circular transaction patterns."
        actions={
          <>
            <Tabs defaultValue="ring">
              <TabsList className="h-8">
                <TabsTrigger value="ring" className="text-xs">Fraud Ring</TabsTrigger>
                <TabsTrigger value="mule" className="text-xs">Mule Network</TabsTrigger>
                <TabsTrigger value="circular" className="text-xs">Circular Tx</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm">Expand Graph</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Detected Rings" value="42" delta={11.4} icon={<GitBranch className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Mule Accounts" value="318" delta={4.8} icon={<Users className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Circular Tx (24h)" value="86" delta={-3.2} icon={<Network className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="High-Risk Clusters" value="14" icon={<AlertOctagon className="h-4 w-4" />} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Relationship Explorer · Cluster #CL-218</CardTitle>
            <CardDescription>Shared device DEV-70241 linking 5 users into a suspected ATO ring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted/40 to-background">
              <svg viewBox="0 0 720 520" className="h-full w-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />
                {edges.map(([a, b, kind], i) => {
                  const na = nodeMap[a], nb = nodeMap[b];
                  if (!na || !nb) return null;
                  return (
                    <line
                      key={i}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke={kind === "alert" ? "var(--color-destructive)" : "var(--color-muted-foreground)"}
                      strokeWidth={kind === "alert" ? 1.5 : 1}
                      strokeOpacity={kind === "alert" ? 0.7 : 0.35}
                      strokeDasharray={kind === "alert" ? "0" : "3 3"}
                    />
                  );
                })}
                {nodes.map((n) => (
                  <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={n.size + 6} fill={colorFor(n.t)} opacity={0.15} />
                    <circle cx={n.x} cy={n.y} r={n.size} fill={colorFor(n.t)} stroke="var(--color-background)" strokeWidth="2" />
                    <text x={n.x} y={n.y + n.size + 14} textAnchor="middle" fontSize="10" fill="var(--color-foreground)" className="font-mono">
                      {n.id}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-md border border-border bg-card/80 p-2 backdrop-blur">
                {[
                  ["user", "User"],
                  ["device", "Device"],
                  ["account", "Account"],
                  ["ip", "IP"],
                  ["merchant", "Merchant"],
                ].map(([t, l]) => (
                  <div key={t} className="flex items-center gap-1.5 text-[10px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(t) }} />
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Clusters</CardTitle>
            <CardDescription>Ranked by risk-weighted score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { id: "CL-218", desc: "ATO ring · 5 users · 1 device", risk: 94 },
              { id: "CL-204", desc: "Mule cluster · 12 accounts", risk: 88 },
              { id: "CL-198", desc: "Circular tx · 3 wallets", risk: 81 },
              { id: "CL-187", desc: "Synthetic ID burst · 8 users", risk: 76 },
              { id: "CL-176", desc: "QRIS merchant abuse", risk: 71 },
              { id: "CL-159", desc: "Promo abuse · 22 accounts", risk: 64 },
            ].map((c) => (
              <button key={c.id} className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 p-2.5 text-left transition hover:border-primary/40 hover:bg-muted/50">
                <div>
                  <div className="font-mono text-xs font-medium">{c.id}</div>
                  <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                </div>
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                  {c.risk}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
