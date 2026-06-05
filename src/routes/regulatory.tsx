import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { regulatoryReports } from "@/lib/mock-data";

export const Route = createFileRoute("/regulatory")({
  head: () => ({ meta: [{ title: "Regulatory Reporting — Sentinel EFRMP" }] }),
  component: RegulatoryPage,
});

function RegulatoryPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Regulatory Reporting"
        description="OJK, Bank Indonesia, internal audit, and management reporting pipelines."
        actions={<Button size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" /> Generate Report</Button>}
      />

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { name: "OJK Fraud", desc: "Quarterly", icon: "OJK", tone: "bg-info/15 text-info" },
          { name: "BI Incident", desc: "Monthly", icon: "BI", tone: "bg-primary/15 text-primary" },
          { name: "Internal Audit", desc: "Half-yearly", icon: "IA", tone: "bg-warning/15 text-warning" },
          { name: "Management", desc: "Monthly", icon: "MG", tone: "bg-success/15 text-success" },
        ].map((r) => (
          <Card key={r.name} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-xs font-bold ${r.tone}`}>
                {r.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submission Register</CardTitle>
          <CardDescription>Export to PDF, Excel, or CSV</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Report ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Regulator</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regulatoryReports.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.regulator}</Badge></TableCell>
                  <TableCell className="text-xs">{r.period}</TableCell>
                  <TableCell><SeverityBadge value={r.status} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.due}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-[11px]"><FileDown className="mr-1 h-3 w-3" />PDF</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[11px]"><FileDown className="mr-1 h-3 w-3" />XLS</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[11px]"><FileDown className="mr-1 h-3 w-3" />CSV</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
