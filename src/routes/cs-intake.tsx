import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageSquareWarning, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useAppStore,
  initCsReports,
  csAddNote,
  csSetStatus,
  csEscalate,
  type CsReport,
} from "@/lib/app-store";

export const Route = createFileRoute("/cs-intake")({
  head: () => ({ meta: [{ title: "Laporan Dugaan Fraud (CS Intake) — Sentinel EFRMP" }] }),
  component: CsIntakePage,
});

const seed: CsReport[] = [
  { id: "CSR-2025-0014", tanggal: "2025-06-10 09:21", pelapor: "Andi Kurniawan", txId: "TX-88102301", deskripsi: "Saldo wallet hilang Rp 1.250.000 tanpa transaksi sah.", status: "In Review", catatan: "Sudah verifikasi KTP & nomor HP.", timeline: [{ ts: "2025-06-10 09:21", actor: "CS · Rina", note: "Tiket dibuat dari panggilan call center." }, { ts: "2025-06-10 10:05", actor: "Fraud Ops", note: "Pengecekan device & IP terakhir." }] },
  { id: "CSR-2025-0015", tanggal: "2025-06-10 11:42", pelapor: "Sinta Wulandari", txId: "TX-88102450", deskripsi: "Dugaan phishing via WhatsApp mengaku admin GoPay.", status: "Open", catatan: "", timeline: [{ ts: "2025-06-10 11:42", actor: "CS · Dimas", note: "Tiket dibuat dari chat in-app." }] },
  { id: "CSR-2025-0016", tanggal: "2025-06-09 14:08", pelapor: "Bambang Hartono", deskripsi: "Promo cashback tidak masuk, dicurigai abuse oleh akun lain.", status: "Resolved", catatan: "Bukan fraud — kesalahan parameter promo.", timeline: [{ ts: "2025-06-09 14:08", actor: "CS · Rina", note: "Tiket dibuat." }, { ts: "2025-06-09 15:30", actor: "Promo Team", note: "Investigasi dan klarifikasi." }, { ts: "2025-06-09 16:10", actor: "CS · Rina", note: "Tiket ditutup." }] },
  { id: "CSR-2025-0017", tanggal: "2025-06-08 08:55", pelapor: "Eko Prasetyo", txId: "TX-88101120", deskripsi: "Transfer P2P diduga ke rekening mule.", status: "In Review", catatan: "Eskalasi diperlukan.", timeline: [{ ts: "2025-06-08 08:55", actor: "CS · Dimas", note: "Tiket dibuat." }] },
];

function CsIntakePage() {
  useEffect(() => { initCsReports(seed); }, []);
  const reports = useAppStore((s) => s.csReports) ?? seed;
  const [openId, setOpenId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

  const current = useMemo(() => reports.find((r) => r.id === openId) ?? null, [openId, reports]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan Dugaan Fraud (CS Intake)"
        description="Kanal pelaporan dugaan fraud dari Customer Service — POJK 12/2024 (pilar Deteksi)."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquareWarning className="h-4 w-4 text-primary" /> {reports.length} laporan masuk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelapor</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Deskripsi Singkat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Linked Case</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="text-xs">{r.tanggal}</TableCell>
                    <TableCell className="text-sm">{r.pelapor}</TableCell>
                    <TableCell className="font-mono text-xs">{r.txId || "—"}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-sm">{r.deskripsi}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "Resolved" ? "secondary" : r.status === "Open" ? "outline" : "default"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{r.caseId || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>Detail</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{current?.id} · {current?.pelapor}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Deskripsi</div>
                <div>{current.deskripsi}</div>
                {current.caseId && (
                  <div className="mt-2 text-xs">
                    Linked Case: <Badge variant="secondary" className="text-[10px]">{current.caseId}</Badge>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Riwayat Penanganan</div>
                <ol className="space-y-2 border-l pl-4">
                  {current.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="text-xs text-muted-foreground">{t.ts} · {t.actor}</div>
                      <div className="text-sm">{t.note}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Tambah Catatan</Label>
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Catatan penanganan…" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Status:</Label>
                    <select
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                      value={current.status}
                      onChange={(e) => {
                        const next = e.target.value as CsReport["status"];
                        csSetStatus(current.id, next);
                        toast.success(`Status diubah ke ${next}`, { description: "Tercatat di Audit Trail." });
                      }}
                    >
                      {(["Open", "In Review", "Resolved"] as CsReport["status"][]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      if (!newNote.trim()) { toast.error("Catatan tidak boleh kosong"); return; }
                      csAddNote(current.id, newNote);
                      setNewNote("");
                      toast.success("Catatan tersimpan", { description: "Tercatat di Audit Trail." });
                    }}>Simpan Catatan</Button>
                    <Button size="sm" disabled={!!current.caseId} onClick={() => {
                      const cid = csEscalate(current.id);
                      toast.success(`Eskalasi berhasil → ${cid}`, { description: "Case baru dibuat di Case Management." });
                    }}>
                      <ArrowUpRight className="h-3 w-3" /> Eskalasi ke Case
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
