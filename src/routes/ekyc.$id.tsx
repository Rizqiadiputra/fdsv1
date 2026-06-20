import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Camera,
  FileText,
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  Plus,
  ExternalLink,
  AlertTriangle,
  Fingerprint,
  Image as ImageIcon,
  MoreHorizontal,
  FileDown,
  RefreshCw,
  FolderPlus,
  ScanLine,
  RotateCcw,
  Ban,
  UserX,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { SeverityBadge } from "@/components/severity-badge";
import { ekycCases } from "@/lib/mock-data";

export const Route = createFileRoute("/ekyc/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Applicant ${params.id} — e-KYC Detail` }],
  }),
  component: ApplicantDetail,
  notFoundComponent: () => (
    <div className="p-8 text-sm">
      Applicant not found.{" "}
      <Link to="/ekyc" className="text-primary underline">
        Back to queue
      </Link>
    </div>
  ),
});

type Applicant = ReturnType<typeof buildApplicant>;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const pick = <T,>(seed: number, arr: T[]) => arr[seed % arr.length];

function buildApplicant(id: string) {
  const base = ekycCases.find((c) => c.id === id);
  if (!base) return null;
  const h = hash(id);
  const firstNames = ["Ahmad", "Siti", "Budi", "Dewi", "Eko", "Fitri", "Rina", "Joko"];
  const lastNames = ["Wijaya", "Rahmawati", "Santoso", "Lestari", "Pratama", "Hidayat"];
  const cities = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan", "Semarang"];
  const provinces = ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "DI Yogyakarta", "Sumatera Utara", "Jawa Tengah"];
  const streets = [
    "Jl. Sudirman No. 21",
    "Jl. Merdeka 14",
    "Jl. Diponegoro 9",
    "Jl. Gatot Subroto 88",
    "Jl. Asia Afrika 5",
  ];
  const nameParts = base.name.split(" ");
  const firstName = pick(h, firstNames);
  const lastName = pick(h >> 3, lastNames);
  const cityIdx = h % cities.length;
  const dobYear = 1985 + (h % 20);
  const dobMonth = String((h % 12) + 1).padStart(2, "0");
  const dobDay = String((h % 27) + 1).padStart(2, "0");
  const dob = `${dobYear}-${dobMonth}-${dobDay}`;
  const age = 2026 - dobYear;
  const now = new Date();
  const t = (offsetMin: number) => new Date(now.getTime() - offsetMin * 60_000).toISOString();

  return {
    applicantId: base.id,
    externalId: `ext-${id.toLowerCase()}-${(h % 9999).toString().padStart(4, "0")}`,
    fullName: `${firstName} ${lastName}`,
    displayName: base.name,
    reviewStatus: base.status as string,
    verificationLevel: "basic-kyc-level",
    reviewCount: 1 + (h % 3),
    reviewDate: t(30 + (h % 600)),
    tags: ["new-applicant", base.risk === "Critical" ? "high-risk" : "standard"],

    personal: {
      firstName,
      lastName,
      dob,
      age,
      gender: h % 2 === 0 ? "Male" : "Female",
      country: "Indonesia",
      nik: base.nik,
      nationality: "IDN",
      placeOfBirth: cities[cityIdx],
    },
    address: {
      street: pick(h >> 5, streets),
      city: cities[cityIdx],
      state: provinces[cityIdx],
      country: "Indonesia",
    },

    document: {
      type: h % 3 === 0 ? "SIM" : "KTP",
      status: base.status === "Approved" ? "Approved" : base.status === "Rejected" ? "Rejected" : "Pending",
      ocr: {
        firstName,
        lastName,
        dob,
        gender: h % 2 === 0 ? "Male" : "Female",
        nationality: "IDN",
        placeOfBirth: cities[cityIdx],
        number: base.nik,
        additionalNumber: `A${(h % 99999).toString().padStart(5, "0")}`,
        address: `${pick(h >> 5, streets)}, ${cities[cityIdx]}`,
      },
    },

    selfie: {
      imageId: `img_${(h % 9999999).toString(16)}`,
      resolution: "1080x1440",
      fileSize: "342 KB",
      type: "image/jpeg",
      livenessResult: base.liveness as "Pass" | "Fail",
    },

    aml: {
      searchTerm: `${firstName} ${lastName}`,
      searchType: "person",
      caseId: `CA-${(h % 999999).toString().padStart(6, "0")}`,
      createdAt: t(120),
      provider: "ComplyAdvantage",
      matchesCount: base.risk === "Critical" ? 3 : base.risk === "High" ? 1 : 0,
      ongoingMonitoring: base.risk === "Low" ? "Off" : "On",
    },

    duplicates: {
      blocklisted: base.blacklistHit ? 1 : 0,
      exact: h % 7 === 0 ? 1 : 0,
      face: base.deviceReuse > 2 ? base.deviceReuse - 1 : 0,
      similar: h % 4,
      items: Array.from({ length: Math.max(1, base.deviceReuse) }).map((_, i) => ({
        fullName: `${pick(h + i, firstNames)} ${pick(h + i * 3, lastNames)}`,
        applicantId: `KYC-${70000 + ((h + i * 17) % 9999)}`,
        externalId: `ext-${((h + i) % 99999).toString().padStart(5, "0")}`,
        yearOfBirth: 1980 + ((h + i) % 25),
        idCard: `32${((h + i * 11) % 9_999_999_999_999).toString().padStart(14, "0")}`,
        country: "Indonesia",
        label: i === 0 && base.blacklistHit ? "Blocklisted" : i % 2 === 0 ? "Face match" : "Similar",
      })),
    },

    timeline: [
      {
        label: "Documents requested",
        at: t(180),
        device: "Chrome 126 / Android 14",
        location: `${cities[cityIdx]}, ID`,
        ip: `103.${h % 255}.${(h >> 4) % 255}.${(h >> 8) % 255}`,
        isp: "Telkomsel",
      },
      {
        label: "Consent accepted",
        at: t(170),
        device: "Chrome 126 / Android 14",
        location: `${cities[cityIdx]}, ID`,
        ip: `103.${h % 255}.${(h >> 4) % 255}.${(h >> 8) % 255}`,
        isp: "Telkomsel",
      },
      {
        label: "Selfie added",
        at: t(155),
        device: "Chrome 126 / Android 14",
        location: `${cities[cityIdx]}, ID`,
        ip: `103.${h % 255}.${(h >> 4) % 255}.${(h >> 8) % 255}`,
        isp: "Telkomsel",
      },
      {
        label: "ID card added",
        at: t(150),
        device: "Chrome 126 / Android 14",
        location: `${cities[cityIdx]}, ID`,
        ip: `103.${h % 255}.${(h >> 4) % 255}.${(h >> 8) % 255}`,
        isp: "Telkomsel",
      },
      { label: "Pending review", at: t(140), device: "—", location: "Server", ip: "—", isp: "—" },
      ...(base.status === "Approved"
        ? [{ label: "Approved", at: t(30), device: "—", location: "Reviewer", ip: "—", isp: "—" }]
        : base.status === "Rejected"
          ? [{ label: "Rejected", at: t(30), device: "—", location: "Reviewer", ip: "—", isp: "—" }]
          : []),
    ],

    notes: [
      { author: "System", at: t(140), text: "Applicant routed to manual review based on rule R-012." },
      ...(base.risk === "Critical"
        ? [{ author: "Andini P.", at: t(40), text: "Liveness score borderline; requesting secondary check." }]
        : []),
    ],

    risk: {
      level: base.risk as string,
      labels: [
        ...(base.blacklistHit ? ["Blacklist Hit"] : []),
        ...(base.liveness === "Fail" ? ["Liveness Fail"] : []),
        ...(base.dukcapil === "Mismatch" ? ["Dukcapil Mismatch"] : []),
        ...(base.deviceReuse > 2 ? ["Device Reuse"] : []),
      ],
    },

    profile: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.id`,
      phone: `+62 81${((h % 100000000) + 10000000).toString().slice(0, 9)}`,
      applicantLanguage: "id",
      sourceKey: "android-app-v3.2",
    },
  };
}

const statusTone = (s: string) =>
  s === "Approved"
    ? "border-success/40 bg-success/10 text-success"
    : s === "Rejected"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : s === "Pending"
        ? "border-warning/40 bg-warning/10 text-warning"
        : "border-primary/40 bg-primary/10 text-primary";

function StatusIcon({ s }: { s: string }) {
  if (s === "Approved" || s === "Pass") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (s === "Rejected" || s === "Fail") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-warning" />;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function ApplicantDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const applicant = useMemo(() => buildApplicant(id), [id]);
  const [tags, setTags] = useState<string[]>(applicant?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(applicant?.notes ?? []);
  const [noteInput, setNoteInput] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string>(applicant?.reviewStatus ?? "");
  const [timeline, setTimeline] = useState(applicant?.timeline ?? []);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectType, setRejectType] = useState("resubmission");
  const [rejectNote, setRejectNote] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [caseOpen, setCaseOpen] = useState(false);
  const [caseReason, setCaseReason] = useState("");

  if (!applicant) {
    return (
      <div className="p-8 text-sm">
        Applicant <span className="font-mono">{id}</span> not found.{" "}
        <Link to="/ekyc" className="text-primary underline">
          Back to queue
        </Link>
      </div>
    );
  }

  const a = applicant as Applicant;
  const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  const logEvent = (label: string) =>
    setTimeline((prev) => [
      ...prev,
      { label, at: new Date().toISOString(), device: "—", location: "Operator", ip: "—", isp: "—" },
    ]);
  const doApprove = () => {
    setReviewStatus("Approved");
    logEvent(`Approved by operator${approveNote ? ` — ${approveNote}` : ""}`);
    toast.success("Applicant approved");
    setApproveOpen(false);
    setApproveNote("");
  };
  const doReject = () => {
    if (!rejectNote.trim()) {
      toast.error("A note is required to reject");
      return;
    }
    setReviewStatus("Rejected");
    logEvent(`Rejected (${rejectType === "final" ? "Final reject" : "Resubmission request"}) — ${rejectNote}`);
    toast.success("Applicant rejected");
    setRejectOpen(false);
    setRejectNote("");
  };
  const doEmail = () => {
    logEvent(`Email sent to applicant — ${emailSubject || "(no subject)"}`);
    toast.success("Email queued to applicant");
    setEmailOpen(false);
    setEmailSubject("");
    setEmailBody("");
  };
  const doCreateCase = () => {
    logEvent(`Case created — ${caseReason || "manual review"}`);
    toast.success("Case created");
    setCaseOpen(false);
    setCaseReason("");
  };
  const doRecheck = () => {
    setReviewStatus("Pending");
    logEvent("Recheck requested");
    toast("Recheck requested");
  };
  const doReOcr = () => {
    logEvent("Document re-OCR triggered");
    toast("Re-OCR triggered");
  };
  const doReset = () => {
    setReviewStatus("Pending");
    logEvent("Applicant reset");
    toast("Applicant reset");
  };
  const doBlocklist = () => {
    logEvent("Applicant blocklisted");
    toast.success("Applicant added to blocklist");
  };
  const doInactive = () => {
    logEvent("Applicant marked inactive");
    toast("Applicant marked inactive");
  };
  const doReport = () => {
    const doc = new jsPDF();
    const left = 14;
    let y = 18;
    const heading = (t: string) => {
      y += 4;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(t, left, y);
      y += 6;
      doc.setFontSize(10);
    };
    const line = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, left, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value ?? "—"), left + 55, y);
      y += 7;
    };
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("e-KYC Applicant Report", left, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, left, y);
    y += 4;
    doc.setDrawColor(200);
    doc.line(left, y, 196, y);

    heading("Identity");
    line("Applicant ID", a!.applicantId);
    line("External ID", a!.externalId);
    line("Full Name", a!.fullName);
    line("Verification Level", a!.verificationLevel);
    line("Review Status", reviewStatus);
    line("Risk Level", a!.risk.level);

    heading("Verification");
    line("Selfie / Liveness", a!.selfie.livenessResult);
    line("Document", `${a!.document.type} — ${a!.document.status}`);
    line("AML Matches", String(a!.aml.matchesCount));
    line("AML Provider", a!.aml.provider);
    line(
      "Duplicates",
      String(a!.duplicates.blocklisted + a!.duplicates.exact + a!.duplicates.face + a!.duplicates.similar),
    );

    heading("Personal Info");
    line("First Name", a!.personal.firstName);
    line("Last Name", a!.personal.lastName);
    line("Date of Birth", `${a!.personal.dob} (${a!.personal.age}y)`);
    line("Gender", a!.personal.gender);
    line("NIK", a!.personal.nik);
    line("Nationality", a!.personal.nationality);
    line("Place of Birth", a!.personal.placeOfBirth);
    line("Address", `${a!.address.street}, ${a!.address.city}, ${a!.address.state}`);

    heading("Risk Labels");
    doc.setFont("helvetica", "normal");
    doc.text(a!.risk.labels.length ? a!.risk.labels.join(", ") : "None", left, y);
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Sentinel EFRMP — confidential. Generated for internal review.", left, 287);

    doc.save(`${a!.applicantId}-ekyc-report.pdf`);
    logEvent("PDF report generated");
    toast.success("Report (PDF) downloaded");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/ekyc" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to queue
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setRejectOpen(true)}>
            <XCircle className="mr-1 h-4 w-4" /> Reject
          </Button>
          <Button size="sm" onClick={() => setApproveOpen(true)}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={doReport}>
                <FileDown className="mr-2 h-4 w-4" /> Generate report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={doRecheck}>
                <RefreshCw className="mr-2 h-4 w-4" /> Request recheck
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCaseOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" /> Create case
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEmailOpen(true)}>
                <Mail className="mr-2 h-4 w-4" /> Email to applicant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={doReOcr}>
                <ScanLine className="mr-2 h-4 w-4" /> Re-OCR document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={doReset}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset applicant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={doBlocklist} className="text-destructive focus:text-destructive">
                <Ban className="mr-2 h-4 w-4" /> Blocklist applicant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={doInactive}>
                <UserX className="mr-2 h-4 w-4" /> Mark as inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PageHeader title={`${a!.fullName}`} description={`${a!.applicantId} • ${a!.verificationLevel}`} />

      {/* Header / Identity */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-[auto,1fr,auto] items-start">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Applicant ID" value={<span className="font-mono">{a!.applicantId}</span>} />
                <Field label="External ID" value={<span className="font-mono text-xs">{a!.externalId}</span>} />
                <Field label="Full Name" value={a!.fullName} />
                <Field label="Verification Level" value={a!.verificationLevel} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tags:</span>
                {tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
                <div className="flex gap-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    className="h-7 w-32 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => {
                      if (tagInput.trim()) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput("");
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-[10px] uppercase text-muted-foreground">Review Status</p>
              <Badge variant="outline" className={`${statusTone(reviewStatus)} text-xs`}>
                {reviewStatus}
              </Badge>
              <div className="flex items-center gap-2 justify-end">
                <SeverityBadge value={a!.risk.level} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Verification Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verification Summary</CardTitle>
            <CardDescription>
              Review count: {a!.reviewCount} • Last reviewed: {fmt(a!.reviewDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                icon: <Camera className="h-4 w-4" />,
                label: "Selfie",
                sub: "Advanced liveness check",
                status: a!.selfie.livenessResult,
              },
              {
                icon: <FileText className="h-4 w-4" />,
                label: "Identity Document",
                sub: `${a!.document.type} card`,
                status: a!.document.status,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">{s.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon s={s.status} />
                  <Badge variant="outline" className={`${statusTone(s.status)} text-[10px]`}>
                    {s.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Labels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Risk
            </CardTitle>
            <CardDescription>Risk level & labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Level</p>
              <SeverityBadge value={a!.risk.level} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Labels</p>
              <div className="flex flex-wrap gap-1">
                {a!.risk.labels.length === 0 && <span className="text-xs text-muted-foreground">No labels</span>}
                {a!.risk.labels.map((l) => (
                  <Badge
                    key={l}
                    variant="outline"
                    className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Info + Address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personal Info (extracted)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="First Name" value={a!.personal.firstName} />
          <Field label="Last Name" value={a!.personal.lastName} />
          <Field label="Date of Birth" value={`${a!.personal.dob} (${a!.personal.age}y)`} />
          <Field label="Gender" value={a!.personal.gender} />
          <Field label="Country" value={a!.personal.country} />
          <Field label="NIK" value={<span className="font-mono text-xs">{a!.personal.nik}</span>} />
          <Field label="Nationality" value={a!.personal.nationality} />
          <Field label="Place of Birth" value={a!.personal.placeOfBirth} />

          <div className="md:col-span-4">
            <Separator className="my-2" />
            <p className="text-xs font-medium mb-3 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Address
            </p>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Street" value={a!.address.street} />
              <Field label="City" value={a!.address.city} />
              <Field label="State / Province" value={a!.address.state} />
              <Field label="Country" value={a!.address.country} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents + Selfie */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Document (KYC)
            </CardTitle>
            <CardDescription>
              {a!.document.type}
              <Badge variant="outline" className={`${statusTone(a!.document.status)} ml-2 text-[10px]`}>
                {a!.document.status}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-[16/10] rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">{a!.document.type} image placeholder</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="First Name" value={a!.document.ocr.firstName} />
              <Field label="Last Name" value={a!.document.ocr.lastName} />
              <Field label="DOB" value={a!.document.ocr.dob} />
              <Field label="Gender" value={a!.document.ocr.gender} />
              <Field label="Nationality" value={a!.document.ocr.nationality} />
              <Field label="Place of Birth" value={a!.document.ocr.placeOfBirth} />
              <Field label="Number (NIK)" value={<span className="font-mono text-xs">{a!.document.ocr.number}</span>} />
              <Field
                label="Additional Number"
                value={<span className="font-mono text-xs">{a!.document.ocr.additionalNumber}</span>}
              />
              <div className="md:col-span-2">
                <Field label="Address" value={a!.document.ocr.address} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" /> Selfie / Liveness
            </CardTitle>
            <CardDescription>
              Liveness:
              <Badge variant="outline" className={`${statusTone(a!.selfie.livenessResult)} ml-2 text-[10px]`}>
                {a!.selfie.livenessResult}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-square rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <User className="h-8 w-8" />
                <span className="text-xs">Selfie placeholder</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Image ID" value={<span className="font-mono text-xs">{a!.selfie.imageId}</span>} />
              <Field label="Resolution" value={a!.selfie.resolution} />
              <Field label="File Size" value={a!.selfie.fileSize} />
              <Field label="Type" value={a!.selfie.type} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AML Screening */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Checks — AML Screening
          </CardTitle>
          <CardDescription>Provider: {a!.aml.provider}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="Search Term" value={a!.aml.searchTerm} />
          <Field label="Search Type" value={a!.aml.searchType} />
          <Field label="Case ID" value={<span className="font-mono text-xs">{a!.aml.caseId}</span>} />
          <Field label="Created At" value={fmt(a!.aml.createdAt)} />
          <Field
            label="Matches"
            value={
              <span className={a!.aml.matchesCount > 0 ? "text-destructive font-semibold" : ""}>
                {a!.aml.matchesCount}
              </span>
            }
          />
          <Field
            label="Ongoing Monitoring"
            value={
              <Badge
                variant="outline"
                className={
                  a!.aml.ongoingMonitoring === "On"
                    ? "border-success/40 bg-success/10 text-success text-[10px]"
                    : "text-[10px]"
                }
              >
                {a!.aml.ongoingMonitoring}
              </Badge>
            }
          />
          <div className="md:col-span-2 flex items-end">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1 h-3 w-3" /> View report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4" /> Duplicates
          </CardTitle>
          <CardDescription>
            Total: {a!.duplicates.blocklisted + a!.duplicates.exact + a!.duplicates.face + a!.duplicates.similar}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blocklisted">
            <TabsList>
              <TabsTrigger value="blocklisted">Blocklisted ({a!.duplicates.blocklisted})</TabsTrigger>
              <TabsTrigger value="exact">Exact ({a!.duplicates.exact})</TabsTrigger>
              <TabsTrigger value="face">Face ({a!.duplicates.face})</TabsTrigger>
              <TabsTrigger value="similar">Similar ({a!.duplicates.similar})</TabsTrigger>
            </TabsList>
            {(["blocklisted", "exact", "face", "similar"] as const).map((tab) => {
              const items = a!.duplicates.items.filter((it) =>
                tab === "blocklisted"
                  ? it.label === "Blocklisted"
                  : tab === "face"
                    ? it.label === "Face match"
                    : tab === "similar"
                      ? it.label === "Similar"
                      : it.label === "Exact",
              );
              return (
                <TabsContent key={tab} value={tab} className="mt-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No {tab} duplicates.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((it, i) => (
                        <div key={i} className="rounded-md border border-border bg-muted/30 p-3">
                          <div className="flex gap-3">
                            <div className="h-14 w-14 rounded bg-muted flex items-center justify-center">
                              <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-0.5 text-xs">
                              <p className="font-medium text-sm">{it.fullName}</p>
                              <p className="font-mono text-muted-foreground">{it.applicantId}</p>
                              <p className="font-mono text-muted-foreground">{it.externalId}</p>
                              <p className="text-muted-foreground">
                                YOB: {it.yearOfBirth} • {it.country}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">ID: {it.idCard}</p>
                              <Badge variant="outline" className="text-[10px] mt-1">
                                {it.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Timeline + Notes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Timeline / Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-border/80 ml-2 space-y-4">
              {timeline.map((ev, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary border border-background" />
                  <p className="text-sm font-medium">{ev.label}</p>
                  <p className="text-[11px] text-muted-foreground">{fmt(ev.at)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {ev.device} • {ev.location} • IP {ev.ip} • {ev.isp}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
              {notes.map((n, i) => (
                <div key={i} className="rounded-md border border-border/60 bg-muted/30 p-2">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{n.author}</span>
                    <span>{fmt(n.at)}</span>
                  </div>
                  <p className="text-sm mt-1">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter note"
                rows={2}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (noteInput.trim()) {
                    setNotes([...notes, { author: "You", at: new Date().toISOString(), text: noteInput.trim() }]);
                    setNoteInput("");
                  }
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> Add note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profile Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field
            label="Email"
            value={
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {a!.profile.email}
              </span>
            }
          />
          <Field
            label="Phone"
            value={
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {a!.profile.phone}
              </span>
            }
          />
          <Field
            label="Applicant Language"
            value={
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" /> {a!.profile.applicantLanguage}
              </span>
            }
          />
          <Field label="Source Key" value={<span className="font-mono text-xs">{a!.profile.sourceKey}</span>} />
        </CardContent>
      </Card>

      {/* ===== Action Dialogs ===== */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve applicant</DialogTitle>
            <DialogDescription>
              Confirm approval for {a!.fullName} ({a!.applicantId}).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional note"
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject applicant</DialogTitle>
            <DialogDescription>Choose rejection type and add a note (required).</DialogDescription>
          </DialogHeader>
          <RadioGroup value={rejectType} onValueChange={setRejectType} className="space-y-1">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="resubmission" id="rt-resub" />
              <Label htmlFor="rt-resub">Resubmission request</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="final" id="rt-final" />
              <Label htmlFor="rt-final">Final reject</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Reason / note (required)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email to applicant</DialogTitle>
            <DialogDescription>Send a message to {a!.profile.email}.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
          <Textarea placeholder="Message" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doEmail}>
              <Send className="mr-1 h-4 w-4" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create case</DialogTitle>
            <DialogDescription>
              Open an investigation case for {a!.fullName} ({a!.applicantId}).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason / summary"
            value={caseReason}
            onChange={(e) => setCaseReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doCreateCase}>Create case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
