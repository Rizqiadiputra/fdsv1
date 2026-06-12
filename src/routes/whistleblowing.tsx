import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/whistleblowing")({
  head: () => ({ meta: [{ title: "Whistleblowing System — Sentinel EFRMP" }] }),
  component: WhistleblowingPage,
});

const tickets = [
  { id: "WBS-2025-0042", tanggal: "2025-06-09", kategori: "Internal Fraud", anonim: true, pelapor: "—", deskripsi: "Dugaan kolusi antara staff dengan merchant fiktif untuk klaim promo.", status: "In Review", linkedFR: "FR-20250003" },
  { id: "WBS-2025-0043", tanggal: "2025-06-08", kategori: "External Fraud", anonim: false, pelapor: "Ahmad W. (karyawan)", deskripsi: "Indikasi phishing terorganisir menyasar nasabah Tier 1.", status: "Open", linkedFR: null },
  { id: "WBS-2025-0044", tanggal: "2025-06-07", kategori: "Conflict of Interest", anonim: true, pelapor: "—", deskripsi: "Vendor pengadaan device terkait dengan keluarga pejabat internal.", status: "Escalated", linkedFR: null },
  { id: "WBS-2025-0045", tanggal: "2025-06-05", kategori: "Money Laundering", anonim: false, pelapor: "Siti R. (Compliance)", deskripsi: "Pola transaksi mule terkoordinasi melalui beberapa merchant QRIS.", status: "Resolved", linkedFR: "FR-20250004" },
  { id: "WBS-2025-0046", tanggal: "2025-06-03", kategori: "Internal Fraud", anonim: true, pelapor: "—", deskripsi: "Dugaan manipulasi parameter rule oleh internal engineer.", status: "Open", linkedFR: null },
];

function WhistleblowingPage() {
  const [rows] = useState(tickets);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Whistleblowing System"
        description="Ringkasan tiket WBS terkait fraud (Fase 1 · sinkronisasi dari kanal WBS eksternal existing). POJK 12/2024 — pilar Deteksi."
        actions={
          <Button size="sm" variant="outline">
            <ExternalLink className="h-3 w-3" /> Buka Kanal WBS Eksternal
          </Button>
        }
      />

      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Catatan:</strong> Halaman ini hanya menampilkan ringkasan tiket WBS terkait fraud dari kanal WBS eksternal perusahaan.
          Sistem ticketing anonymous reporting, enkripsi end-to-end, dan workflow eskalasi otomatis termasuk dalam <em>Fase 2</em> dan tidak dibangun ulang di sini.
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldAlert className="h-4 w-4 text-primary" /> {rows.length} tiket WBS terkait fraud
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Anonim</TableHead>
                  <TableHead>Pelapor</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link Fraud Register</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="text-xs">{t.tanggal}</TableCell>
                    <TableCell className="text-sm">{t.kategori}</TableCell>
                    <TableCell>
                      <Badge variant={t.anonim ? "secondary" : "outline"} className="text-[10px]">
                        {t.anonim ? "Ya" : "Tidak"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{t.pelapor}</TableCell>
                    <TableCell className="max-w-[320px] truncate text-sm">{t.deskripsi}</TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === "Resolved" ? "secondary" : t.status === "Escalated" ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.linkedFR ? (
                        <Badge variant="default" className="text-[10px] font-mono">{t.linkedFR}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
