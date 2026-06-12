import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auditLog } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Trail — Sentinel EFRMP" }] }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Trail"
        description="Immutable record of every user, system, and configuration change."
        actions={<Button variant="outline" size="sm">Export</Button>}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" /> Activity Log</CardTitle>
          <Input placeholder="Search user, action, object…" className="h-8 w-[280px]" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Object</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((a, i) => (
                <TableRow key={i} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.ts}</TableCell>
                  <TableCell className="text-xs"><Badge variant="outline" className="font-mono text-[10px]">{a.user}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">
                    {a.action}
                    {a.sensitive && (
                      <Badge variant="outline" className="ml-1.5 border-warning/40 bg-warning/10 text-[9px] text-warning">sensitive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{a.object}</TableCell>
                  {a.sensitive ? (
                    <>
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.before}</TableCell>
                      <TableCell className="font-mono text-xs text-foreground">{a.after}</TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={2} className="text-xs italic text-muted-foreground">
                      {a.summary} <span className="ml-1 text-[10px]">(snapshot tidak disimpan — bukan field teregulasi)</span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
