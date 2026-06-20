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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
          device: ["Android 13 · Samsung A54", "iOS 17 · iPhone 13", "Android 12 · Xiaomi 11", "iOS 16 · iPhone 12"][
            i % 4
          ],
          deviceId: `DEV-${70234 + (i % 16)}`,
          fingerprint: `fp_${(i * 9301 + 49297).toString(16).padStart(12, "0").slice(0, 12)}`,
          deviceStatus:
            i % 7 === 0 ? "Rooted" : i % 11 === 0 ? "Emulator" : i % 5 === 0 ? "Shared (3 users)" : "Normal",
          ip: `103.${20 + (i % 80)}.${10 + i}.${5 + i}`,
          vpnFlag: i % 6 === 0,
          evaluatedRules: allRules.map((name, k) => ({
            name,
            result: triggeredSet.has(name) ? ("Hit" as const) : k % 3 === i % 3 ? ("Hit" as const) : ("Pass" as const),
            score: triggeredSet.has(name) ? 15 + ((k * 7) % 25) : (k * 3) % 8,
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
                    <TableCell>
                      <SourceBadge source={q.source} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{fmtIDR(q.amount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {q.rulesTriggered.slice(0, 2).map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px]">
                            {r.split(" ")[0]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {acted[q.id] ? (
                        <Badge
                          variant={acted[q.id] === "Approved" ? "secondary" : "destructive"}
                          className="text-[10px]"
                        >
                          {acted[q.id]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Under Review
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpen(q)}>
                        Tinjau
                      </Button>
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
            <DialogTitle>
              Tinjau Transaksi · {open?.txId} <span className="ml-2 text-xs text-muted-foreground">({open?.id})</span>
            </DialogTitle>
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
                <Field
                  label="Status"
                  value={open.deviceStatus}
                  badge={open.deviceStatus !== "Normal" ? "warn" : undefined}
                />
              </Section>

              <Section title="Network">
                <Field label="IP Address" value={open.ip} mono />
                <Field
                  label="VPN/Proxy"
                  value={open.vpnFlag ? "Terdeteksi" : "Tidak"}
                  badge={open.vpnFlag ? "warn" : undefined}
                />
                <Field label="Source" value={open.source} badge="info" />
                <Field label="Lokasi" value={open.location} />
              </Section>

              <Section title="Riwayat User (User Intelligence)">
                <Field label="Total Transaksi" value={String(open.history.tx)} />
                <Field label="Total Alert Sebelumnya" value={String(open.history.alerts)} />
                <Field
                  label="Fraud Terkonfirmasi"
                  value={String(open.history.confirmedFraud)}
                  badge={open.history.confirmedFraud > 0 ? "danger" : undefined}
                />
                <Field label="Tipe Fraud Terindikasi" value={open.fraudType} />
              </Section>

              <TxDetailExtras row={open} />

              <Separator />
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Rules Dievaluasi ({open.evaluatedRules.length})
                </div>
                <div className="space-y-1">
                  {open.evaluatedRules.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded border px-2 py-1.5">
                      <span className="font-mono text-xs">{r.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">+{r.score} pts</span>
                        <Badge variant={r.result === "Hit" ? "destructive" : "secondary"} className="text-[10px]">
                          {r.result}
                        </Badge>
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
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button size="sm" onClick={applyAction}>
              Konfirmasi
            </Button>
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

function Field({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: "info" | "warn" | "danger";
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      {badge ? (
        <Badge
          variant="outline"
          className={
            "mt-1 text-[10px] " +
            (badge === "danger"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : badge === "warn"
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-info/40 bg-info/10 text-info")
          }
        >
          {value}
        </Badge>
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
        (source === "Sumsub" ? "border-info/40 bg-info/10 text-info" : "border-success/40 bg-success/10 text-success")
      }
    >
      {source}
    </Badge>
  );
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildTxDetail(row: Row) {
  const h = hashStr(row.txId);
  const out = h % 2 === 0;
  const banks = [
    ["BMRIIDJA", "Bank Mandiri"],
    ["BNINIDJA", "Bank BNI"],
    ["CENAIDJA", "Bank BCA"],
    ["BRINIDJA", "Bank BRI"],
  ];
  const pmTypes = ["account", "card", "wallet"];
  const cities = ["Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Yogyakarta"];
  const rb = banks[h % banks.length];
  const bb = banks[(h >> 3) % banks.length];
  const total = row.history.tx || 50;
  const approved = Math.round(total * 0.82);
  const hold = Math.round(total * 0.12);
  const rejected = Math.max(0, total - approved - hold);
  const base = new Date(row.ts).getTime();
  const fmtT = (m: number) =>
    new Date(base - m * 60000).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
  return {
    direction: out ? "out" : "in",
    paymentDetails: ["Transfer dana", "Pembayaran QRIS", "Top up wallet", "Bill payment", "Cash out"][h % 5],
    mcc: String(4000 + (h % 5999)),
    currencyType: "fiat",
    type: "finance",
    zoneId: "Asia/Jakarta (UTC+7)",
    sourceKey: `app-${(h % 9999).toString().padStart(4, "0")}`,
    remitter: {
      fullName: row.user || "—",
      type: "individual",
      address: `${cities[h % cities.length]}, ID`,
      paymentMethod: `${pmTypes[h % pmTypes.length]} · ${(h % 999999).toString().padStart(6, "0")}** · ID`,
      institution: `${rb[0]} · ${rb[1]}`,
    },
    beneficiary: {
      externalUserId: `ext-${(h % 9_999_999).toString(16)}`,
      fullName: ["Jack Posek", "Maria Tan", "Liang Wei", "Andi Saputra", "Rudi H."][h % 5],
      type: h % 4 === 0 ? "company" : "individual",
      address: `${cities[(h >> 2) % cities.length]}, ID`,
      paymentMethod: `${pmTypes[(h >> 1) % pmTypes.length]} · ${(h % 888888).toString().padStart(6, "0")}** · ID`,
      institution: `${bb[0]} · ${bb[1]}`,
    },
    props: { dailyOutLimit: 10_000_000, custom: `velocity_window=${(h % 30) + 5}m` },
    aml: {
      status: row.history.confirmedFraud > 0 ? "Match found" : "Clear",
      provider: "ComplyAdvantage",
      matches: row.history.confirmedFraud > 0 ? (h % 3) + 1 : 0,
    },
    financial: {
      volumeSent: ((h % 900) + 100) * 100000,
      volumeReceived: (((h >> 3) % 900) + 100) * 100000,
      count: total,
      byStatus: { approved, hold, rejected },
    },
    log: [
      { label: "Transaction received", at: fmtT(6) },
      { label: "Scored by engine", at: fmtT(5) },
      { label: "Routed to manual review", at: fmtT(4) },
    ],
    timeline: [
      { label: "Created", at: fmtT(8) },
      { label: "Risk evaluated", at: fmtT(6) },
      { label: row.status === "New" ? "Queued" : "In review", at: fmtT(3) },
    ],
    related: {
      applicant: Array.from({ length: 3 }).map((_, i) => ({
        txId: `TX-${900000 + ((h + i * 13) % 99999)}`,
        amount: (((h + i) % 900) + 50) * 1000,
        status: ["Approved", "Hold", "Rejected"][(h + i) % 3],
      })),
      device: Array.from({ length: 2 }).map((_, i) => ({
        txId: `TX-${900000 + ((h + i * 29) % 99999)}`,
        amount: (((h + i) % 500) + 30) * 1000,
        status: ["Approved", "Hold"][(h + i) % 2],
      })),
      payment: Array.from({ length: 2 }).map((_, i) => ({
        txId: `TX-${900000 + ((h + i * 41) % 99999)}`,
        amount: (((h + i) % 700) + 40) * 1000,
        status: ["Approved", "Rejected"][(h + i) % 2],
      })),
    },
  };
}

function RelList({ items }: { items: { txId: string; amount: number; status: string }[] }) {
  return (
    <div className="space-y-1">
      {items.map((it) => (
        <div key={it.txId} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
          <span className="font-mono">{it.txId}</span>
          <span>{fmtIDR(it.amount)}</span>
          <Badge variant="outline" className="text-[10px]">
            {it.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function TxDetailExtras({ row }: { row: Row }) {
  const d = buildTxDetail(row);
  return (
    <>
      <Section title="Info (Sumsub)">
        <Field label="Direction" value={d.direction === "out" ? "Outbound (out)" : "Inbound (in)"} badge="info" />
        <Field label="Payment Details" value={d.paymentDetails} />
        <Field label="MCC" value={d.mcc} mono />
        <Field label="Currency Type" value={d.currencyType} />
        <Field label="Type" value={d.type} />
        <Field label="Zone" value={d.zoneId} />
        <Field label="Source Key" value={d.sourceKey} mono />
      </Section>

      <Section title="Remitter (applicant)">
        <Field label="Full Name" value={d.remitter.fullName} />
        <Field label="Type" value={d.remitter.type} />
        <Field label="Address" value={d.remitter.address} />
        <Field label="Payment Method" value={d.remitter.paymentMethod} mono />
        <Field label="Institution" value={d.remitter.institution} />
      </Section>

      <Section title="Beneficiary (counterparty)">
        <Field label="External User ID" value={d.beneficiary.externalUserId} mono />
        <Field label="Full Name" value={d.beneficiary.fullName} />
        <Field label="Type" value={d.beneficiary.type} />
        <Field label="Address" value={d.beneficiary.address} />
        <Field label="Payment Method" value={d.beneficiary.paymentMethod} mono />
        <Field label="Institution" value={d.beneficiary.institution} />
      </Section>

      <Section title="Properties (props)">
        <Field label="Daily Out Limit" value={fmtIDR(d.props.dailyOutLimit)} />
        <Field label="Custom" value={d.props.custom} mono />
      </Section>

      <Section title="AML Check">
        <Field label="Status" value={d.aml.status} badge={d.aml.matches > 0 ? "danger" : "info"} />
        <Field label="Provider" value={d.aml.provider} />
        <Field label="Matches" value={String(d.aml.matches)} badge={d.aml.matches > 0 ? "danger" : undefined} />
      </Section>

      <Section title="Applicant Financial History">
        <Field label="Volume Sent" value={fmtIDR(d.financial.volumeSent)} />
        <Field label="Volume Received" value={fmtIDR(d.financial.volumeReceived)} />
        <Field label="Transaction Count" value={String(d.financial.count)} />
        <Field
          label="Count by Status"
          value={`Approved ${d.financial.byStatus.approved} · Hold ${d.financial.byStatus.hold} · Rejected ${d.financial.byStatus.rejected}`}
        />
      </Section>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Log</div>
        <div className="space-y-1">
          {d.log.map((l) => (
            <div key={l.label} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
              <span>{l.label}</span>
              <span className="text-muted-foreground">{l.at}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Timeline</div>
        <ol className="relative ml-2 space-y-3 border-l border-border/80">
          {d.timeline.map((ev) => (
            <li key={ev.label} className="ml-4">
              <span className="absolute -left-1.5 mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-xs font-medium">{ev.label}</p>
              <p className="text-[10px] text-muted-foreground">{ev.at}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Related Transactions</div>
        <Tabs defaultValue="applicant">
          <TabsList>
            <TabsTrigger value="applicant">Same applicant ({d.related.applicant.length})</TabsTrigger>
            <TabsTrigger value="device">Same device ({d.related.device.length})</TabsTrigger>
            <TabsTrigger value="payment">Same payment ({d.related.payment.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="applicant" className="mt-2">
            <RelList items={d.related.applicant} />
          </TabsContent>
          <TabsContent value="device" className="mt-2">
            <RelList items={d.related.device} />
          </TabsContent>
          <TabsContent value="payment" className="mt-2">
            <RelList items={d.related.payment} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
