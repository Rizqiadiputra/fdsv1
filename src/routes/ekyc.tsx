import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserCheck, ShieldAlert, Camera, Fingerprint, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { ekycCases } from "@/lib/mock-data";

export const Route = createFileRoute("/ekyc")({
  head: () => ({
    meta: [
      { title: "e-KYC Fraud Monitor — Sentinel EFRMP" },
      { name: "description", content: "Onboarding fraud detection with Dukcapil match, liveness, and selfie biometrics." },
    ],
  }),
  component: EKyc,
});

function EKyc() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <PageHeader
        title="e-KYC Fraud Monitor"
        description="Onboarding risk: Dukcapil NIK validation, liveness detection, face-match, and device reuse analysis."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Registrations (24h)" value="12,482" delta={5.4} icon={<UserCheck className="h-4 w-4" />} tone="info" />
        <KpiCard label="Liveness Failures" value="312" delta={8.1} icon={<Camera className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Dukcapil Mismatch" value="148" delta={-4.2} icon={<Fingerprint className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Synthetic ID Suspects" value="36" delta={12.0} icon={<ShieldAlert className="h-4 w-4" />} tone="destructive" invertDelta />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Selfie Match Pass", v: "96.4%", t: "vs target 95%" },
          { l: "Liveness Pass", v: "97.8%", t: "Active + Passive" },
          { l: "Dukcapil Verified", v: "98.2%", t: "NIK + DOB" },
          { l: "Device Reuse Block", v: "1.2%", t: "≥ 3 accounts/device" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{k.l}</p>
              <p className="mt-1 text-2xl font-semibold">{k.v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{k.t}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Onboarding Risk Queue</CardTitle>
          <CardDescription>Cases requiring manual review per BI/OJK KYC standards</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Case</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Selfie Match</TableHead>
                <TableHead>Liveness</TableHead>
                <TableHead>Dukcapil</TableHead>
                <TableHead>Device Reuse</TableHead>
                <TableHead>Blacklist</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ekycCases.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="text-xs font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.nik}</TableCell>
                  <TableCell className="font-mono text-xs">{c.selfieMatch}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.liveness === "Pass" ? "border-success/40 bg-success/10 text-success text-[10px]" : "border-destructive/40 bg-destructive/10 text-destructive text-[10px]"}>{c.liveness}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.dukcapil === "Matched" ? "border-success/40 bg-success/10 text-success text-[10px]" : "border-destructive/40 bg-destructive/10 text-destructive text-[10px]"}>{c.dukcapil}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.deviceReuse}</TableCell>
                  <TableCell>{c.blacklistHit ? <Badge variant="destructive" className="text-[10px]">Hit</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell><SeverityBadge value={c.risk} /></TableCell>
                  <TableCell><SeverityBadge value={c.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
