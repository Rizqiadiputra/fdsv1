import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldQuestion, Clock, Ban, Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { alerts, fmtIDR } from "@/lib/mock-data";

export const Route = createFileRoute("/suspicious")({
  head: () => ({ meta: [{ title: "Suspicious Transactions — Sentinel EFRMP" }] }),
  component: SuspiciousPage,
});

type Row = typeof alerts[number] & {
  device?: string;
  ip?: string;
  source?: string;
  evaluatedRules?: { name: string; result: "Hit" | "Pass" }[];
  history?: { tx: number; alerts: number };
};

function SuspiciousPage() {
  const queue: Row[] = useMemo(
    () =>
      alerts
        .filter((a) => a.status === "In Review" || a.status === "New")
        .map((a, i) => ({
          ...a,
          device: ["Android 13 · Samsung A54", "iOS 17 · iPhone 13", "Android 12 · Xiaomi 11", "iOS 16 · iPhone 12"][i % 4],
          ip: `103.${20 + (i % 80)}.${10 + i}.${5 + i}`,
          source: i % 3 === 0 ? "Sumsub" : "Internal",
          evaluatedRules: [
            { name: "R-1042 New Device + Cash Out", result: i % 2 ? "Hit" : "Pass" },
            { name: "R-2007 Multiple QRIS Payments", result: i % 3 ? "Hit" : "Pass" },
            { name: "R-3015 Wallet Transfer Burst", result: "Hit" },
            { name: "R-4002 Money Mule Pattern", result: i % 4 ? "Pass" : "Hit" },
          ],
          history: { tx: 40 + i * 11, alerts: (i % 5) + 1 },
        }))
        .sort((a, b) => a.ts.localeCompare(b.ts)),
    [],
  );

  const [open, setOpen] = useState<Row | null>(null);
  const [acted, setActed] = useState<Record<string, "Approved" | "Rejected" | "Blacklisted">>({});

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suspicious Transactions (Manual Review)"
        description="Queue manual review transaksi berstatus Under Review — PADG 24/2024 (deteksi & respons transaksi mencurigakan)."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldQuestion className="h-4 w-4 text-primary" /> Queue · {queue.length} transaksi menunggu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Rule Terpicu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {q.ts}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{q.id}</TableCell>
                    <TableCell className="font-mono text-xs">{q.user}</TableCell>
                    <TableCell className="text-sm">{q.userName}</TableCell>
                    <TableCell className="font-mono text-xs">{fmtIDR(q.amount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {q.rulesTriggered.slice(0, 2).map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px]">{r.split(" ")[0]}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {acted[q.id] ? (
                        <Badge variant="secondary" className="text-[10px]">{acted[q.id]}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Under Review</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpen(q)}>Tinjau</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tinjau Transaksi · {open?.id}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3">
                <Field label="Nominal" value={fmtIDR(open.amount)} />
                <Field label="Waktu" value={open.ts} />
                <Field label="Tipe Fraud" value={open.fraudType} />
                <Field label="Risk Score" value={String(open.score)} />
                <Field label="User" value={`${open.user} · ${open.userName}`} />
                <Field label="Lokasi" value={open.location} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Device Info" value={open.device || "-"} />
                <Field label="IP Address" value={open.ip || "-"} />
                <Field label="Sumber" value={open.source || "-"} badge />
                <Field label="Riwayat User" value={`${open.history?.tx} tx · ${open.history?.alerts} alerts`} />
              </div>

              <Separator />
              <div>
                <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Rules Dievaluasi</div>
                <div className="space-y-1">
                  {open.evaluatedRules?.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded border px-2 py-1.5">
                      <span className="font-mono text-xs">{r.name}</span>
                      <Badge variant={r.result === "Hit" ? "destructive" : "secondary"} className="text-[10px]">{r.result}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setActed((a) => ({ ...a, [open.id]: "Approved" })); setOpen(null); }}>
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { setActed((a) => ({ ...a, [open.id]: "Rejected" })); setOpen(null); }}>
                  <X className="h-3 w-3" /> Reject
                </Button>
                <Button size="sm" onClick={() => { setActed((a) => ({ ...a, [open.id]: "Blacklisted" })); setOpen(null); }}>
                  <Ban className="h-3 w-3" /> Blacklist
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      {badge ? (
        <Badge variant="outline" className="mt-1 text-[10px]">{value}</Badge>
      ) : (
        <div className="text-sm">{value}</div>
      )}
    </div>
  );
}
