import { useState, useMemo } from "react";
import { createFileRoute, useNavigate, Outlet, useChildMatches } from "@tanstack/react-router";
import { UserCheck, ShieldAlert, Camera, Fingerprint, ChevronRight, Plus, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/severity-badge";
import { toast } from "sonner";
import { ekycCases } from "@/lib/mock-data";

export const Route = createFileRoute("/ekyc")({
  head: () => ({
    meta: [
      { title: "e-KYC Fraud Monitor — Sentinel EFRMP" },
      {
        name: "description",
        content: "Onboarding fraud detection with Dukcapil match, liveness, and selfie biometrics.",
      },
    ],
  }),
  component: EKyc,
});

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const REJECT_REASONS = ["Forgery", "Selfie mismatch", "Document expired", "Dukcapil mismatch"];
const PLATFORMS = ["Android", "iOS", "Web"];
const fmtDate = (d: Date) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

type Row = ReturnType<typeof enrich>[number];

function enrich() {
  return ekycCases.map((c) => {
    const h = hash(c.id);
    const documentType = h % 3 === 0 ? "SIM" : "KTP";
    const platform = PLATFORMS[h % PLATFORMS.length];
    const decided = c.status === "Approved" || c.status === "Rejected";
    const startedDays = (h % 25) + 2;
    const reviewStarted = fmtDate(new Date(Date.now() - startedDays * 86_400_000));
    const reviewed = decided ? fmtDate(new Date(Date.now() - (startedDays - 1) * 86_400_000)) : "—";
    const duration = decided ? `${(h % 9) + 1}m ${(h % 50) + 5}s` : "—";
    const rejectLabel =
      c.status === "Rejected" ? REJECT_REASONS[h % REJECT_REASONS.length] : c.blacklistHit ? "Blocklist" : "—";
    const tags = ["new-applicant", c.risk === "Critical" ? "high-risk" : "standard"];
    return { ...c, documentType, platform, reviewStarted, reviewed, duration, rejectLabel, tags };
  });
}

function EKyc() {
  const navigate = useNavigate();
  const childMatches = useChildMatches();
  if (childMatches.length > 0) {
    return <Outlet />;
  }
  return <EKycList navigate={navigate} />;
}

function EKycList({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const rows = useMemo(enrich, []);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fRisk, setFRisk] = useState("all");
  const [fDoc, setFDoc] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fReject, setFReject] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cNik, setCNik] = useState("");
  const [cCountry, setCCountry] = useState("Indonesia");
  const [cLevel, setCLevel] = useState("basic-kyc-level");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !`${r.id} ${r.name} ${r.nik}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fRisk !== "all" && r.risk !== fRisk) return false;
      if (fDoc !== "all" && r.documentType !== fDoc) return false;
      if (fPlatform !== "all" && r.platform !== fPlatform) return false;
      if (fReject !== "all") {
        if (fReject === "none" && r.rejectLabel !== "—") return false;
        if (fReject === "any" && r.rejectLabel === "—") return false;
      }
      return true;
    });
  }, [rows, q, fStatus, fRisk, fDoc, fPlatform, fReject]);

  const resetFilters = () => {
    setQ("");
    setFStatus("all");
    setFRisk("all");
    setFDoc("all");
    setFPlatform("all");
    setFReject("all");
  };

  const exportCsv = () => {
    const header = [
      "Case",
      "Name",
      "NIK",
      "Selfie Match",
      "Liveness",
      "Dukcapil",
      "Device Reuse",
      "Blacklist",
      "Risk",
      "Status",
      "Review Started",
      "Reviewed",
      "Duration",
      "Reject Label",
      "Tags",
    ];
    const lines = filtered.map((r) =>
      [
        r.id,
        r.name,
        r.nik,
        `${r.selfieMatch}%`,
        r.liveness,
        r.dukcapil,
        r.deviceReuse,
        r.blacklistHit ? "Hit" : "-",
        r.risk,
        r.status,
        r.reviewStarted,
        r.reviewed,
        r.duration,
        r.rejectLabel,
        r.tags.join("|"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ekyc-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows to CSV`);
  };

  const createApplicant = () => {
    if (!cName.trim() || !cNik.trim()) {
      toast.error("Name and NIK are required");
      return;
    }
    toast.success(`Applicant "${cName}" created (mock)`);
    setCreateOpen(false);
    setCName("");
    setCNik("");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="e-KYC Fraud Monitor"
        description="Onboarding risk: Dukcapil NIK validation, liveness detection, face-match, and device reuse analysis."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Registrations (24h)"
          value="12,482"
          delta={5.4}
          icon={<UserCheck className="h-4 w-4" />}
          tone="info"
        />
        <KpiCard
          label="Liveness Failures"
          value="312"
          delta={8.1}
          icon={<Camera className="h-4 w-4" />}
          tone="warning"
          invertDelta
        />
        <KpiCard
          label="Dukcapil Mismatch"
          value="148"
          delta={-4.2}
          icon={<Fingerprint className="h-4 w-4" />}
          tone="success"
          invertDelta
        />
        <KpiCard
          label="Synthetic ID Suspects"
          value="36"
          delta={12.0}
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="destructive"
          invertDelta
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Selfie Match Pass", v: "96.4%", t: "vs target 95%" },
          { l: "Liveness Pass", v: "97.8%", t: "Active + Passive" },
          { l: "Dukcapil Verified", v: "98.2%", t: "NIK + DOB" },
          { l: "Device Reuse Block", v: "1.2%", t: "≥ 3 accounts/device" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{k.l}</p>
              <p className="mt-1 text-2xl font-semibold">{k.v}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{k.t}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Onboarding Risk Queue</CardTitle>
              <CardDescription>Cases requiring manual review per BI/OJK KYC standards</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="mr-1 h-4 w-4" /> Download CSV
              </Button>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Create applicant
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name / NIK / case"
                className="h-8 w-56 pl-7 text-xs"
              />
            </div>
            <FilterSelect
              value={fStatus}
              onChange={setFStatus}
              placeholder="Review status"
              options={["Pending", "Approved", "Rejected", "Manual Review"]}
            />
            <FilterSelect
              value={fRisk}
              onChange={setFRisk}
              placeholder="Risk"
              options={["Critical", "High", "Medium", "Low"]}
            />
            <FilterSelect value={fDoc} onChange={setFDoc} placeholder="Document type" options={["KTP", "SIM"]} />
            <FilterSelect value={fPlatform} onChange={setFPlatform} placeholder="Platform" options={PLATFORMS} />
            <FilterSelect
              value={fReject}
              onChange={setFReject}
              placeholder="Reject label"
              options={[
                { v: "any", l: "Has label" },
                { v: "none", l: "No label" },
              ]}
            />
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>
              Reset
            </Button>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {filtered.length} of {rows.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Case</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Review Status</TableHead>
                <TableHead>Review Started</TableHead>
                <TableHead>Reviewed</TableHead>
                <TableHead>Reject Label</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => navigate({ to: "/ekyc/$id", params: { id: c.id } })}
                >
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="text-xs font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.nik}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Camera
                        className={`h-3.5 w-3.5 ${c.liveness === "Pass" ? "text-success" : "text-destructive"}`}
                      />
                      <Fingerprint className="h-3.5 w-3.5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge value={c.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.reviewStarted}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.reviewed}
                    {c.duration !== "—" && <span className="block text-[10px]">Took {c.duration}</span>}
                  </TableCell>
                  <TableCell>
                    {c.rejectLabel === "—" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                      >
                        {c.rejectLabel}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge value={c.risk} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
                    No applicants match the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create applicant */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create applicant</DialogTitle>
            <DialogDescription>Add a new applicant to the onboarding queue (mock).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="c-name">Full name</Label>
              <Input
                id="c-name"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="e.g. Andi Saputra"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-nik">NIK</Label>
              <Input id="c-nik" value={cNik} onChange={(e) => setCNik(e.target.value)} placeholder="16-digit NIK" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Country</Label>
                <Select value={cCountry} onValueChange={setCCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                    <SelectItem value="Malaysia">Malaysia</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Level</Label>
                <Select value={cLevel} onValueChange={setCLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic-kyc-level">basic-kyc-level</SelectItem>
                    <SelectItem value="enhanced-kyc-level">enhanced-kyc-level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createApplicant}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: (string | { v: string; l: string })[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}: All</SelectItem>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          return (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
