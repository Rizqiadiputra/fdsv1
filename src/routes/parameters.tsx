import { createFileRoute } from "@tanstack/react-router";
import { Sliders, Save, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fraudParameters } from "@/lib/mock-data";

export const Route = createFileRoute("/parameters")({
  head: () => ({
    meta: [
      { title: "Fraud Parameter Configurator — Sentinel EFRMP" },
      { name: "description", content: "Centralized configuration of fraud thresholds, limits, and decision parameters." },
    ],
  }),
  component: Parameters,
});

function Parameters() {
  const categories = Array.from(new Set(fraudParameters.map((p) => p.category)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fraud Parameter Configurator"
        description="Tune transaction limits, velocity windows, scoring thresholds, and decision policies across the platform."
        actions={
          <>
            <Button variant="outline" size="sm"><History className="mr-1.5 h-3.5 w-3.5" /> Audit Log</Button>
            <Button size="sm"><Save className="mr-1.5 h-3.5 w-3.5" /> Publish Changes</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.slice(0, 4).map((c) => (
          <Card key={c}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c}</p>
              <p className="mt-1 text-2xl font-semibold">{fraudParameters.filter((p) => p.category === c).length}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">parameters</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-base">Active Parameters</CardTitle>
              <CardDescription>Editable. Changes require maker-checker approval per Risk Governance.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Key</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[220px]">Value</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fraudParameters.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-mono text-xs">{p.key}</TableCell>
                  <TableCell className="text-xs">{p.label}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.category}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.owner}</TableCell>
                  <TableCell><Input defaultValue={p.value} className="h-8 font-mono text-xs" /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Stage</Button>
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
