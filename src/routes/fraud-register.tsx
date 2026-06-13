import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cases, fmtIDR } from "@/lib/mock-data";

export const Route = createFileRoute("/fraud-register")({
  head: () => ({ meta: [{ title: "Confirmed Fraud Register — Sentinel EFRMP" }] }),
  component: FraudRegisterPage,
});

const fraudJenis = ["Account Takeover (ATO)", "Money Mule", "Phishing", "QRIS Fraud", "Promo Abuse", "Synthetic Identity"];

function FraudRegisterPage() {
  const reports = useMemo(
    () =>
      cases
        .filter((c) => c.status === "Fraud Confirmed" || c.status === "Closed")
        .map((c, i) => ({
          reportId: `FR-${(2025_0001 + i).toString()}`,
          tanggal: `2025-${String(((i % 6) + 1)).padStart(2, "0")}-${String(((i % 27) + 1)).padStart(2, "0")}`,
          tipe: c.type,
          pelaku: ["Eksternal — Nasabah", "Eksternal — Pihak Ke-3", "Internal — Karyawan"][i % 3],
          pelakuNama: ["Tidak Diketahui", "Bambang H.", "Sinta W.", "Tidak Diketahui", "Rudi A."][i % 5],
          jabatan: i % 3 === 2 ? "Staff Operasional" : "—",
          userId: c.user,
          statusTL: ["Dalam Investigasi", "Dilaporkan ke OJK", "Selesai", "Eskalasi ke Aparat"][i % 4],
          aktivitas: ["Cash out wallet", "Transfer P2P", "Pembayaran QRIS", "Top-up & burst"][i % 4],
          deskripsi: "Pelaku melakukan pengambilalihan akun melalui SIM swap, kemudian melakukan cash out berulang dalam 30 menit.",
          lokasi: c.location,
          divisi: c.division,
          pihakDirugikan: ["Nasabah", "Perusahaan", "Merchant"][i % 3],
          waktu: `2025-${String(((i % 6) + 1)).padStart(2, "0")}-${String(((i % 27) + 1)).padStart(2, "0")} ${String(((i * 3) % 24)).padStart(2, "0")}:30`,
          kerugian: c.lossAmount,
          recovery: c.recoveredAmount,
          penyebab: "Lemahnya verifikasi tambahan saat penggantian SIM oleh operator telco.",
          penanganan: "Blokir wallet, freeze rekening tujuan, refund nasabah.",
          perbaikan: "Tambah challenge OTP + device binding ulang setelah SIM swap event.",
          dokumen: "https://dms.internal/fraud/" + `FR-${(2025_0001 + i).toString()}`,
          caseId: c.id,
        })),
    [],
  );

  const [open, setOpen] = useState<typeof reports[number] | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Confirmed Fraud Register"
        description="Register fraud terkonfirmasi — POJK 12/2024 (16 field, pelaporan semester). Sumber data: Case Management."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => alert("Export PDF (semua laporan) — mock")}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => alert("Export Excel (semua laporan) — mock")}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Export Excel
            </Button>
          </>
        }
      />


      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" /> {reports.length} laporan fraud terkonfirmasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe Fraud</TableHead>
                  <TableHead>Pelaku</TableHead>
                  <TableHead>Nilai Kerugian</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.reportId}>
                    <TableCell className="font-mono text-xs">{r.reportId}</TableCell>
                    <TableCell className="text-xs">{r.tanggal}</TableCell>
                    <TableCell className="text-sm">{r.tipe}</TableCell>
                    <TableCell className="text-sm">{r.pelaku}</TableCell>
                    <TableCell className="font-mono text-xs">{fmtIDR(r.kerugian)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpen(r)}>Detail</Button>
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
            <DialogTitle className="flex items-center justify-between gap-2">
              <span>Laporan Fraud · {open?.reportId}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Download className="h-3 w-3" /> Export PDF</Button>
                <Button size="sm" variant="outline"><FileSpreadsheet className="h-3 w-3" /> Export Excel</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {open && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <F label="1. Nama Pelaku" defaultValue={open.pelakuNama} />
              <F label="2. Jabatan Pelaku" defaultValue={open.jabatan} />
              <F label="3. User ID (jika nasabah)" defaultValue={open.userId} />
              <F label="4. Status Tindak Lanjut" defaultValue={open.statusTL} />
              <Select label="5. Jenis Fraud" defaultValue={open.tipe} options={fraudJenis} />
              <F label="6. Aktivitas Terkait" defaultValue={open.aktivitas} />
              <FArea label="7. Deskripsi & Modus Operasi" defaultValue={open.deskripsi} span />
              <F label="8. Lokasi Kejadian" defaultValue={open.lokasi} />
              <F label="9. Divisi/Unit Kerja" defaultValue={open.divisi} />
              <F label="10. Pihak Dirugikan" defaultValue={open.pihakDirugikan} />
              <F label="11. Waktu Kejadian" defaultValue={open.waktu} />
              <F label="12. Jumlah Kerugian (Rp)" defaultValue={String(open.kerugian)} />
              <F label="13. Jumlah Recovery (Rp)" defaultValue={String(open.recovery)} />
              <FArea label="14. Penyebab" defaultValue={open.penyebab} span />
              <FArea label="15. Tindakan Penanganan" defaultValue={open.penanganan} span />
              <FArea label="16. Tindakan Perbaikan" defaultValue={open.perbaikan} span />
              <div className="col-span-2">
                <Label className="text-[10px] uppercase text-muted-foreground">Dokumen Pendukung (Link URL ke storage existing — SharePoint/Drive/DMS)</Label>
                <Input className="mt-1" defaultValue={open.dokumen} placeholder="https://..." />
                <p className="mt-1 text-[10px] text-muted-foreground">Catatan: hanya menyimpan link, tidak melakukan upload file.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function F({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
      <Input className="mt-1" defaultValue={defaultValue} />
    </div>
  );
}
function FArea({ label, defaultValue, span }: { label: string; defaultValue: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
      <Textarea className="mt-1 min-h-16" defaultValue={defaultValue} />
    </div>
  );
}
function Select({ label, defaultValue, options }: { label: string; defaultValue: string; options: string[] }) {
  return (
    <div>
      <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
      <select className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" defaultValue={defaultValue}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        {!options.includes(defaultValue) && <option value={defaultValue}>{defaultValue}</option>}
      </select>
    </div>
  );
}
