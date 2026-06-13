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
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Report = {
  reportId: string; tanggal: string; tipe: string; pelaku: string; pelakuNama: string;
  jabatan: string; userId: string; statusTL: string; aktivitas: string; deskripsi: string;
  lokasi: string; divisi: string; pihakDirugikan: string; waktu: string;
  kerugian: number; recovery: number; penyebab: string; penanganan: string;
  perbaikan: string; dokumen: string; caseId: string;
};

const FIELDS: { key: keyof Report; label: string }[] = [
  { key: "reportId", label: "Report ID" },
  { key: "tanggal", label: "Tanggal" },
  { key: "pelakuNama", label: "Nama Pelaku" },
  { key: "jabatan", label: "Jabatan" },
  { key: "userId", label: "User ID" },
  { key: "statusTL", label: "Status Tindak Lanjut" },
  { key: "tipe", label: "Jenis Fraud" },
  { key: "aktivitas", label: "Aktivitas Terkait" },
  { key: "deskripsi", label: "Deskripsi & Modus" },
  { key: "lokasi", label: "Lokasi" },
  { key: "divisi", label: "Divisi" },
  { key: "pihakDirugikan", label: "Pihak Dirugikan" },
  { key: "waktu", label: "Waktu Kejadian" },
  { key: "kerugian", label: "Kerugian (Rp)" },
  { key: "recovery", label: "Recovery (Rp)" },
  { key: "penyebab", label: "Penyebab" },
  { key: "penanganan", label: "Penanganan" },
  { key: "perbaikan", label: "Perbaikan" },
  { key: "dokumen", label: "Dokumen Pendukung" },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV(rows: Report[], filename: string) {
  const header = FIELDS.map((f) => f.label).join(",");
  const body = rows.map((r) =>
    FIELDS.map((f) => {
      const v = String(r[f.key] ?? "").replace(/"/g, '""');
      return `"${v}"`;
    }).join(","),
  ).join("\n");
  const csv = "\ufeff" + header + "\n" + body;
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
  toast.success("Laporan berhasil diunduh", { description: filename });
}

function exportPDF(rows: Report[], filename: string, title: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("id-ID")} · ${rows.length} laporan`, 40, 56);

  if (rows.length === 1) {
    const r = rows[0];
    autoTable(doc, {
      startY: 72,
      head: [["Field", "Value"]],
      body: FIELDS.map((f) => [f.label, String(r[f.key] ?? "")]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 0: { cellWidth: 160, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
    });
  } else {
    const cols = FIELDS.slice(0, 8);
    autoTable(doc, {
      startY: 72,
      head: [cols.map((c) => c.label)],
      body: rows.map((r) => cols.map((c) => String(r[c.key] ?? ""))),
      styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [30, 41, 59] },
    });
  }
  doc.save(filename);
  toast.success("Laporan berhasil diunduh", { description: filename });
}

export const Route = createFileRoute("/fraud-register")({
  head: () => ({ meta: [{ title: "Confirmed Fraud Register — Sentinel EFRMP" }] }),
  component: FraudRegisterPage,
});

const fraudJenis = ["Account Takeover (ATO)", "Money Mule", "Phishing", "QRIS Fraud", "Promo Abuse", "Synthetic Identity"];

function FraudRegisterPage() {
  const reports = useMemo(() => {
    const narrativeByType: Record<string, { aktivitas: string; deskripsi: (c: typeof cases[number]) => string; penyebab: string; penanganan: string; perbaikan: string; pihak: string }> = {
      "Account Takeover": {
        aktivitas: "Login dari device baru + cash out wallet",
        deskripsi: (c) => `Pelaku berhasil login ke akun ${c.user} dari device baru tanpa challenge tambahan, kemudian melakukan cash out ${fmtIDR(c.lossAmount)} ke ${c.perpetratorAccount} dalam <15 menit.`,
        penyebab: "Kredensial nasabah bocor (phishing) dan rule device-binding tidak memicu step-up authentication pada login pertama dari device baru.",
        penanganan: "Suspend wallet, freeze rekening tujuan, reset kredensial nasabah, refund parsial.",
        perbaikan: "Wajib step-up biometric/OTP pada login device baru + cooling-off 1 jam untuk cash out pertama.",
        pihak: "Nasabah",
      },
      "Money Mule": {
        aktivitas: "Penerimaan transfer fan-in & forward keluar",
        deskripsi: (c) => `Akun ${c.user} berperan sebagai mule — menerima dana fan-in dari ≥8 wallet berbeda lalu meneruskan ke ${c.perpetratorAccount} dengan total ${fmtIDR(c.lossAmount)}.`,
        penyebab: "Pola fan-in/fan-out tidak terdeteksi rule velocity karena nominal per-transaksi di bawah threshold.",
        penanganan: "Blokir wallet mule, laporan LTKM ke PPATK, koordinasi dengan bank tujuan.",
        perbaikan: "Tambah rule graph-based mule detection (fan-in count + holding time <30 menit).",
        pihak: "Nasabah & Pihak Ke-3",
      },
      "QRIS Fraud": {
        aktivitas: "Pembayaran QRIS ke merchant fiktif berulang",
        deskripsi: (c) => `Transaksi QRIS berulang dari ${c.user} ke merchant terindikasi fiktif senilai total ${fmtIDR(c.lossAmount)} di area ${c.location}.`,
        penyebab: "Onboarding merchant kurang ketat — KYB hanya berbasis dokumen tanpa verifikasi fisik lokasi usaha.",
        penanganan: "Suspend MID merchant, hold settlement, investigasi acquirer.",
        perbaikan: "Wajibkan geo-verification & site visit untuk merchant high-risk MCC.",
        pihak: "Perusahaan & Merchant",
      },
      "Promo Abuse": {
        aktivitas: "Multi-account redemption promo cashback",
        deskripsi: (c) => `Cluster ${Math.floor(c.lossAmount / 50000)} akun terhubung satu device fingerprint melakukan redeem promo cashback berulang, total kerugian ${fmtIDR(c.lossAmount)}.`,
        penyebab: "Rule promo eligibility tidak cek device fingerprint & shared IP.",
        penanganan: "Cabut cashback, blacklist device & IP, blokir akun terkait cluster.",
        perbaikan: "Tambah device-fingerprint dedup + IP velocity limit pada engine eligibility promo.",
        pihak: "Perusahaan",
      },
      "Wallet Transfer Burst": {
        aktivitas: "Transfer P2P berulang dalam interval singkat",
        deskripsi: (c) => `Akun ${c.user} melakukan ≥12 transfer P2P dalam 10 menit ke ${c.perpetratorAccount} dengan total ${fmtIDR(c.lossAmount)} — pola structuring untuk hindari threshold.`,
        penyebab: "Threshold velocity per-menit terlalu longgar dan tidak mempertimbangkan agregat per-penerima.",
        penanganan: "Hold saldo, reverse transaksi terakhir, eskalasi ke Cyber Security.",
        perbaikan: "Tighten rule R-3015: max 5 transfer/10 menit dan agregat ke single beneficiary.",
        pihak: "Nasabah",
      },
      "SIM Swap": {
        aktivitas: "Reset OTP pasca penggantian SIM operator",
        deskripsi: (c) => `Pasca event SIM swap pada nomor ter-binding akun ${c.user}, pelaku reset OTP dan melakukan cash out ${fmtIDR(c.lossAmount)} ke ${c.perpetratorAccount}.`,
        penyebab: "Tidak ada cooling-off pasca event SIM swap dari telco — OTP langsung dapat digunakan.",
        penanganan: "Blokir wallet, freeze rekening tujuan, refund nasabah, koordinasi dengan telco.",
        perbaikan: "Integrasi feed SIM-swap dari telco + cooling-off 24 jam untuk transaksi sensitif.",
        pihak: "Nasabah",
      },
      "Synthetic Identity": {
        aktivitas: "Pembukaan akun dengan identitas sintetis untuk pencairan",
        deskripsi: (c) => `Akun ${c.user} dibuka menggunakan kombinasi NIK valid + nama & foto sintetis (deepfake liveness), digunakan untuk menampung & mencairkan dana ${fmtIDR(c.lossAmount)}.`,
        penyebab: "Liveness check eKYC dapat dilewati dengan deepfake video; cross-check NIK-foto Dukcapil tidak strict.",
        penanganan: "Tutup akun, blacklist NIK & device, laporkan ke Dukcapil & PPATK.",
        perbaikan: "Upgrade liveness vendor ke active challenge + face-match Dukcapil mandatory untuk Tier 2.",
        pihak: "Perusahaan & Nasabah",
      },
    };

    const fallback = narrativeByType["Account Takeover"];
    const namaPelakuPool = ["Tidak Diketahui", "Bambang H.", "Sinta W.", "Rudi A.", "Hendra K.", "Maya L."];

    return cases
      .filter((c) => c.status === "Fraud Confirmed" || c.status === "Closed")
      .map((c, i) => {
        const n = narrativeByType[c.type] ?? fallback;
        const isInternal = c.division.toLowerCase().includes("internal") || i % 9 === 0;
        const pelakuKategori = isInternal ? "Internal — Karyawan" : c.type === "Money Mule" || c.type === "Synthetic Identity" ? "Eksternal — Pihak Ke-3" : "Eksternal — Nasabah";
        const tanggal = `2025-${String(((i % 6) + 1)).padStart(2, "0")}-${String(((i % 27) + 1)).padStart(2, "0")}`;
        const jam = `${String((7 + (i * 3)) % 24).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`;
        return {
          reportId: `FR-${(2025_0001 + i).toString()}`,
          tanggal,
          tipe: c.type,
          pelaku: pelakuKategori,
          pelakuNama: isInternal ? namaPelakuPool[(i % (namaPelakuPool.length - 1)) + 1] : namaPelakuPool[i % namaPelakuPool.length],
          jabatan: isInternal ? ["Staff Operasional", "Customer Service", "Staff Settlement"][i % 3] : "—",
          userId: c.user,
          statusTL: ["Dalam Investigasi", "Dilaporkan ke OJK", "Selesai", "Eskalasi ke Aparat"][i % 4],
          aktivitas: n.aktivitas,
          deskripsi: n.deskripsi(c),
          lokasi: c.location,
          divisi: c.division,
          pihakDirugikan: n.pihak,
          waktu: `${tanggal} ${jam} WIB`,
          kerugian: c.lossAmount,
          recovery: c.recoveredAmount,
          penyebab: n.penyebab,
          penanganan: n.penanganan,
          perbaikan: n.perbaikan,
          dokumen: `https://dms.internal/fraud/FR-${(2025_0001 + i).toString()}`,
          caseId: c.id,
        };
      });
  }, []);

  const [open, setOpen] = useState<Report | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Confirmed Fraud Register"
        description="Register fraud terkonfirmasi — POJK 12/2024 (16 field, pelaporan semester). Sumber data: Case Management."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => exportPDF(reports, `fraud-register-${new Date().toISOString().slice(0,10)}.pdf`, "Confirmed Fraud Register — POJK 12/2024")}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportCSV(reports, `fraud-register-${new Date().toISOString().slice(0,10)}.csv`)}>
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
                <Button size="sm" variant="outline" onClick={() => open && exportPDF([open], `${open.reportId}.pdf`, `Laporan Fraud · ${open.reportId}`)}><Download className="h-3 w-3" /> Export PDF</Button>
                <Button size="sm" variant="outline" onClick={() => open && exportCSV([open], `${open.reportId}.csv`)}><FileSpreadsheet className="h-3 w-3" /> Export Excel</Button>
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
