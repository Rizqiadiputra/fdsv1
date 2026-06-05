import { createFileRoute } from "@tanstack/react-router";
import { Ban, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { blacklists } from "@/lib/mock-data";

export const Route = createFileRoute("/blacklist")({
  head: () => ({ meta: [{ title: "Blacklist Management — Sentinel EFRMP" }] }),
  component: BlacklistPage,
});

const tabs: { key: keyof typeof blacklists; label: string }[] = [
  { key: "user", label: "User" },
  { key: "device", label: "Device" },
  { key: "merchant", label: "Merchant" },
  { key: "account", label: "Bank Account" },
  { key: "ip", label: "IP Address" },
];

function BlacklistPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Blacklist Management"
        description="Centralized denylists across users, devices, merchants, bank accounts, and IP addresses."
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Entry</Button>}
      />

      <Tabs defaultValue="user">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
              <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">{blacklists[t.key].length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <Input placeholder={`Search ${t.label.toLowerCase()}…`} className="h-8 w-[260px]" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ban className="h-3.5 w-3.5" /> {blacklists[t.key].length} entries
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Identifier</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklists[t.key].map((b) => (
                      <TableRow key={b.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">{b.id}</TableCell>
                        <TableCell className="text-xs">{b.reason}</TableCell>
                        <TableCell className="text-xs">{b.addedBy}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
