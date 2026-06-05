import { createFileRoute } from "@tanstack/react-router";
import { Store, AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { merchantsList, fmtIDR, fmtNum } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/merchants")({
  head: () => ({
    meta: [
      { title: "Merchant Intelligence — Sentinel EFRMP" },
      { name: "description", content: "QRIS merchant risk profiling, chargeback and refund pattern monitoring." },
    ],
  }),
  component: Merchants,
});

function Merchants() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Merchant Intelligence"
        description="QRIS and online merchant risk profiling, MDR leakage detection, and refund/chargeback analytics."
        actions={<Button size="sm">Export Merchant Risk Report</Button>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Merchants" value={fmtNum(248912)} delta={4.8} icon={<Store className="h-4 w-4" />} tone="info" />
        <KpiCard label="High-Risk Merchants" value="312" delta={6.2} icon={<AlertTriangle className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Chargeback Ratio" value="0.18%" delta={-0.04} icon={<TrendingDown className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="QRIS Certified" value="99.4%" delta={0.2} icon={<ShieldCheck className="h-4 w-4" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Merchant Risk Register</CardTitle>
            <CardDescription>Ranked by composite risk score</CardDescription>
          </div>
          <Input placeholder="Search merchant, MCC, name…" className="h-8 w-[260px]" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Merchant ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>MCC</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>QRIS</TableHead>
                <TableHead className="text-right">Tx (30d)</TableHead>
                <TableHead className="text-right">GMV (30d)</TableHead>
                <TableHead className="text-right">CB %</TableHead>
                <TableHead className="text-right">Refund %</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantsList.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell className="font-mono text-xs">{m.mcc}</TableCell>
                  <TableCell className="text-xs">{m.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{m.qrisStatic ? "Static" : "Dynamic"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmtNum(m.tx30d)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmtIDR(m.gmv30d)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{m.chargebackRate}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{m.refundRate}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.flag}</TableCell>
                  <TableCell><SeverityBadge value={m.risk} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
