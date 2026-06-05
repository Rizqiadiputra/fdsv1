import { createFileRoute } from "@tanstack/react-router";
import { Smartphone, Fingerprint, Ban, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { devices, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [{ title: "Device Intelligence — Sentinel EFRMP" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Device Intelligence"
        description="Device fingerprinting, jailbreak/emulator detection, and shared-device anomaly surface."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Tracked Devices" value={fmtNum(1284512)} icon={<Smartphone className="h-4 w-4" />} tone="info" />
        <KpiCard label="Suspicious Fingerprints" value="2,134" delta={9.2} icon={<Fingerprint className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Blacklisted Devices" value="412" delta={3.1} icon={<Ban className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Emulator Detected" value="184" delta={-6.4} icon={<AlertTriangle className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Device Repository</CardTitle>
            <CardDescription>Top devices by alert volume</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Device ID</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Alerts</TableHead>
                    <TableHead className="text-right">Fraud</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">{d.id}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{d.fingerprint}</TableCell>
                      <TableCell className="text-xs">{d.os}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{d.users}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{d.alerts}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{d.fraud}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {d.root && <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive">Root</Badge>}
                          {d.emulator && <Badge variant="outline" className="border-warning/30 bg-warning/10 text-[10px] text-warning">Emulator</Badge>}
                          {d.users > 4 && <Badge variant="outline" className="border-warning/30 bg-warning/10 text-[10px] text-warning">Shared</Badge>}
                          {d.blacklisted && <Badge variant="outline" className="border-critical/40 bg-critical/15 text-[10px] text-critical">Blacklist</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suspicious Patterns</CardTitle>
            <CardDescription>Auto-flagged anomalies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { t: "1 device, 6+ users", c: 24, tone: "destructive" },
              { t: "Emulator + new account", c: 18, tone: "warning" },
              { t: "Rooted + high value tx", c: 12, tone: "destructive" },
              { t: "Frequent device switching", c: 34, tone: "warning" },
              { t: "GPS spoofing detected", c: 7, tone: "destructive" },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-2.5">
                <span className="text-xs">{r.t}</span>
                <Badge variant="outline" className={r.tone === "destructive" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning"}>
                  {r.c}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
