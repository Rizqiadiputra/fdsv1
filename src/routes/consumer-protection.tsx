import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SeverityBadge } from "@/components/severity-badge";
import { complaints } from "@/lib/mock-data";

export const Route = createFileRoute("/consumer-protection")({
  head: () => ({ meta: [{ title: "Consumer Protection — Sentinel EFRMP" }] }),
  component: ConsumerPage,
});

function ConsumerPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Consumer Protection"
        description="Complaints, disputes, and chargeback management aligned with OJK consumer protection rules."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Complaint Ratio" value="0.042%" delta={1.4} icon={<MessageCircle className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Resolution Time" value="1.8 d" delta={-12.0} icon={<Clock className="h-4 w-4" />} tone="success" invertDelta />
        <KpiCard label="Open Complaints" value="184" delta={-3.2} icon={<AlertCircle className="h-4 w-4" />} tone="info" invertDelta />
        <KpiCard label="Resolved (MTD)" value="1,248" delta={8.6} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
      </div>

      <Tabs defaultValue="complaint">
        <TabsList>
          <TabsTrigger value="complaint">Complaints</TabsTrigger>
          <TabsTrigger value="dispute">Disputes</TabsTrigger>
          <TabsTrigger value="chargeback">Chargebacks</TabsTrigger>
        </TabsList>
        <TabsContent value="complaint">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Complaint Queue</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Complaint ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Age (d)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="font-mono text-xs">{c.user}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.tx}</TableCell>
                      <TableCell className="text-xs">{c.category}</TableCell>
                      <TableCell><SeverityBadge value={c.status} /></TableCell>
                      <TableCell className="text-center font-mono text-xs">{c.age}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dispute">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">42 active disputes · Rp 1.8 B in scope · avg 3.2d resolution.</CardContent></Card>
        </TabsContent>
        <TabsContent value="chargeback">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">28 chargebacks pending issuer response · Rp 642 M exposure.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
