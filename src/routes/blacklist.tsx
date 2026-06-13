import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { blacklists } from "@/lib/mock-data";
import { useAppStore, addBlacklist, removeBlacklist, type BlacklistCategory } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/blacklist")({
  head: () => ({ meta: [{ title: "Blacklist Management — Sentinel EFRMP" }] }),
  component: BlacklistPage,
});

const tabs: { key: BlacklistCategory; label: string }[] = [
  { key: "user", label: "User" },
  { key: "device", label: "Device" },
  { key: "merchant", label: "Merchant" },
  { key: "account", label: "Bank Account" },
  { key: "ip", label: "IP Address" },
];

function BlacklistPage() {
  const extra = useAppStore((s) => s.extraBlacklists);
  const removed = useAppStore((s) => s.removedBlacklists);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<{ category: BlacklistCategory; id: string; reason: string }>({
    category: "user",
    id: "",
    reason: "",
  });

  const merged = useMemo(() => {
    const out: Record<BlacklistCategory, { id: string; reason: string; addedBy: string; date: string }[]> = {
      user: [], device: [], merchant: [], account: [], ip: [],
    };
    for (const t of tabs) {
      const removedSet = new Set(removed[t.key]);
      out[t.key] = [
        ...extra[t.key],
        ...blacklists[t.key].filter((b) => !removedSet.has(b.id)),
      ];
    }
    return out;
  }, [extra, removed]);

  function submitAdd() {
    if (!form.id.trim() || !form.reason.trim()) {
      toast.error("Identifier dan alasan wajib diisi");
      return;
    }
    addBlacklist(form.category, { id: form.id.trim(), reason: form.reason.trim() });
    toast.success(`Entry ditambahkan ke blacklist ${form.category}`, { description: "Tercatat di Audit Trail." });
    setForm({ category: form.category, id: "", reason: "" });
    setAddOpen(false);
  }

  function handleRemove(cat: BlacklistCategory, id: string) {
    removeBlacklist(cat, id);
    toast.success(`${id} dihapus dari blacklist`, { description: "Tercatat di Audit Trail." });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Blacklist Management"
        description="Centralized denylists across users, devices, merchants, bank accounts, and IP addresses."
        actions={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Entry</Button>}
      />

      <Tabs defaultValue="user">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
              <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">{merged[t.key].length}</Badge>
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
                    <Ban className="h-3.5 w-3.5" /> {merged[t.key].length} entries
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
                    {merged[t.key].map((b) => (
                      <TableRow key={b.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">{b.id}</TableCell>
                        <TableCell className="text-xs">{b.reason}</TableCell>
                        <TableCell className="text-xs">{b.addedBy}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleRemove(t.key, b.id)}>Remove</Button>
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Blacklist Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Kategori</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as BlacklistCategory }))}
              >
                {tabs.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Identifier</Label>
              <Input
                className="mt-1"
                placeholder="USR-40001 / DEV-70234 / 103.45.10.7"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Alasan</Label>
              <Input
                className="mt-1"
                placeholder="Alasan blacklist…"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button size="sm" onClick={submitAdd}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
