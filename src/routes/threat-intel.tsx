import { createFileRoute } from "@tanstack/react-router";
import { Radar, Skull, ShieldAlert, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { threatIntel } from "@/lib/mock-data";

export const Route = createFileRoute("/threat-intel")({
  head: () => ({
    meta: [
      { title: "Cyber Threat Intelligence — Sentinel EFRMP" },
      { name: "description", content: "External threat intelligence feeds targeting Indonesian e-wallets." },
    ],
  }),
  component: ThreatIntel,
});

function ThreatIntel() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Cyber Threat Intelligence"
        description="Threat actors, phishing campaigns, mule recruitment, and dark web chatter targeting Indonesian e-wallets."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active IoCs" value="3,418" delta={8.4} icon={<Radar className="h-4 w-4" />} tone="info" />
        <KpiCard label="Phishing Sites" value="184" delta={12.6} icon={<Eye className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Dark Web Mentions" value="62" delta={-4.1} icon={<Skull className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Takedowns (30d)" value="48" delta={18.2} icon={<ShieldAlert className="h-4 w-4" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Active Threat Feed</CardTitle>
          <CardDescription>Curated intelligence with confidence scoring</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Target Wallet</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threatIntel.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="text-xs font-medium">{t.type}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.source}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.target}</Badge></TableCell>
                  <TableCell className="text-xs">{t.confidence}</TableCell>
                  <TableCell><SeverityBadge value={t.severity} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.seen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
