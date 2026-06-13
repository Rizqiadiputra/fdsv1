import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldQuestion, Clock, Ban, Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { alerts, fmtIDR, users, type Alert, type Source } from "@/lib/mock-data";
import { useAppStore, applyAlertAction, type AlertOverride } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/suspicious")({
  head: () => ({ meta: [{ title: "Suspicious Transactions — Sentinel EFRMP" }] }),
  component: SuspiciousPage,
});

type Row = Alert & {
  device: string;
  deviceId: string;
  fingerprint: string;
  deviceStatus: string;
  ip: string;
  vpnFlag: boolean;
  evaluatedRules: { name: string; result: "Hit" | "Pass"; score: number }[];
  history: { tx: number; alerts: number; confirmedFraud: number };
};

const allRules = [
  "R-1042 New Device + Cash Out",
  "R-2007 Multiple QRIS Payments",
  "R-3015 Wallet Transfer Burst",
  "R-4002 Money Mule Pattern",
  "R-5031 Promo Abuse Burst",
  "R-6018 SIM Swap Indicator",
  "R-7022 Account Takeover Signal",
];

function SuspiciousPage() {
  const queue: Row[] = useMemo(() => {
    return alerts
      .filter((a) => a.status === "In Review" || a.status === "New")
      .map((a, i) => {
        const u = users.find((u) => u.id === a.user);
        const triggeredSet = new Set(a.rulesTriggered);
        return {
          ...a,
          device: ["Android 13 · Samsung A54", "iOS 17 · iPhone 13", "Android 12 · Xiaomi 11", "iOS 16 · iPhone 12"][i % 4],
          deviceId: `DEV-${70234 + (i % 16)}`,
          fingerprint: `fp_${(i * 9301 + 49297).toString(16).padStart(12, "0").slice(0, 12)}`,
          deviceStatus: i % 7 === 0 ? "Rooted" : i % 11 === 0 ? "Emulator" : i % 5 === 0 ? "Shared (3 users)" : "Normal",
          ip: `103.${20 + (i % 80)}.${10 + i}.${5 + i}`,
          vpnFlag: i % 6 === 0,
          evaluatedRules: allRules.map((name, k) => ({
            name,
            result: triggeredSet.has(name) ? ("Hit" as const) : k % 3 === (i % 3) ? ("Hit" as const) : ("Pass" as const),
            score: triggeredSet.has(name) ? 15 + (k * 7) % 25 : (k * 3) % 8,
          })),
          history: {
            tx: u?.tx ?? 40 + i * 11,
            alerts: u?.alerts ?? (i % 5) + 1,
            confirmedFraud: u?.fraud ?? 0,
          },
        };
      })
      .sort((a, b) => a.ts.localeCompare(b.ts));
  }, []);

  const [open, setOpen] = useState<Row | null>(null);
  const acted = useAppStore((s) => s.alertOverrides);
  const [confirm, setConfirm] = useState<{ row: Row; action: AlertOverride } | null>(null);

  function applyAction() {
    if (!confirm) return;
    applyAlertAction({
      alertId: confirm.row.id,
      txId: confirm.row.txId,
      userId: confirm.row.user,
      action: confirm.action,
      previousStatus: "Under Review",
    });
    toast.success(`Transaksi ${confirm.row.txId} ditandai ${confirm.action}`, {
      description: "Tercatat di Audit Trail" + (confirm.action === "Blacklisted" ? " & Blacklist Management." : "."),
    });
    setConfirm(null);
    setOpen(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suspicious Transactions (Manual Review)"
        description="Queue manual review transaksi berstatus Under Review — PADG 24/2024 (deteksi & respons transaksi mencurigakan)."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldQuestion className="h-4 w-4 text-primary" /> Queue · {queue.length} transaksi menunggu (oldest first)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Rule Terpicu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {q.ts}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{q.txId}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{q.id}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-mono">{q.user}</div>
                      <div className="text-[10px] text-muted-foreground">{q.userName}</div>
                    </TableCell>
                    <TableCell><SourceBadge source={q.source} /></TableCell>
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
                        <Badge
                          variant={acted[q.id] === "Approved" ? "secondary" : "destructive"}
                          className="text-[10px]"
                        >{acted[q.id]}</Badge>
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tinjau Transaksi · {open?.txId} <span className="ml-2 text-xs text-muted-foreground">({open?.id})</span></DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4 text-sm">
              <Section title="Detail Transaksi">
                <Field label="Transaction ID" value={open.txId} />
                <Field label="Nominal" value={fmtIDR(open.amount)} />
                <Field label="Waktu" value={open.ts} />
                <Field label="Channel" value="QRIS Payment" />
                <Field label="Wallet" value="GoPay" />
                <Field label="Merchant" value="Indomaret #4521" />
              </Section>

              <Section title="Device Intelligence">
                <Field label="Device ID" value={open.deviceId} />
                <Field label="Fingerprint" value={open.fingerprint} mono />
                <Field label="OS / Model" value={open.device} />
                <Field label="Status" value={open.deviceStatus} badge={open.deviceStatus !== "Normal" ? "warn" : undefined} />
              </Section>

              <Section title="Network">
                <Field label="IP Address" value={open.ip} mono />
                <Field label="VPN/Proxy" value={open.vpnFlag ? "Terdeteksi" : "Tidak"} badge={open.vpnFlag ? "warn" : undefined} />
                <Field label="Source" value={open.source} badge="info" />
                <Field label="Lokasi" value={open.location} />
              </Section>

              <Section title="Riwayat User (User Intelligence)">
                <Field label="Total Transaksi" value={String(open.history.tx)} />
                <Field label="Total Alert Sebelumnya" value={String(open.history.alerts)} />
                <Field label="Fraud Terkonfirmasi" value={String(open.history.confirmedFraud)} badge={open.history.confirmedFraud > 0 ? "danger" : undefined} />
                <Field label="Tipe Fraud Terindikasi" value={open.fraudType} />
              </Section>

              <Separator />
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Rules Dievaluasi ({open.evaluatedRules.length})</div>
                <div className="space-y-1">
                  {open.evaluatedRules.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded border px-2 py-1.5">
                      <span className="font-mono text-xs">{r.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">+{r.score} pts</span>
                        <Badge variant={r.result === "Hit" ? "destructive" : "secondary"} className="text-[10px]">{r.result}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {open && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirm({ row: open, action: "Approved" })}>
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setConfirm({ row: open, action: "Rejected" })}>
                  <X className="h-3 w-3" /> Reject
                </Button>
                <Button size="sm" onClick={() => setConfirm({ row: open, action: "Blacklisted" })}>
                  <Ban className="h-3 w-3" /> Blacklist
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi · {confirm?.action}</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Anda akan menandai transaksi <span className="font-mono">{confirm?.row.txId}</span> sebagai{" "}
            <strong>{confirm?.action}</strong>. Aksi ini akan tercatat di Audit Trail.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Batal</Button>
            <Button size="sm" onClick={applyAction}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: "info" | "warn" | "danger" }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      {badge ? (
        <Badge
          variant="outline"
          className={
            "mt-1 text-[10px] " +
            (badge === "danger" ? "border-destructive/40 bg-destructive/10 text-destructive" :
              badge === "warn" ? "border-warning/40 bg-warning/10 text-warning" :
                "border-info/40 bg-info/10 text-info")
          }
        >{value}</Badge>
      ) : (
        <div className={mono ? "font-mono text-xs" : "text-sm"}>{value}</div>
      )}
    </div>
  );
}

function SourceBadge({ source }: { source: Source }) {
  return (
    <Badge
      variant="outline"
      className={
        "text-[10px] " +
        (source === "Sumsub"
          ? "border-info/40 bg-info/10 text-info"
          : "border-success/40 bg-success/10 text-success")
      }
    >{source}</Badge>
  );
}
