import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Activity,
  KeyRound,
  Clock,
  Bell,
  Languages,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  changeOwnPassword,
  getCurrentUser,
  logout,
  useAppStore,
} from "@/lib/app-store";
import { ROLE_LABEL, ROLE_DESCRIPTION, listAllowedMenus } from "@/lib/rbac";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Sentinel EFRMP" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  useAppStore((s) => s.session); // re-render on change
  const audit = useAppStore((s) => s.extraAudit);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { theme, setTheme } = useTheme();

  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [notif, setNotif] = useState({ alert: true, weekly: true, sla: false });
  const [lang, setLang] = useState<"id" | "en">("id");

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menus = listAllowedMenus(user.role);
  const myAudit = audit.filter((a) => a.user === user.username).slice(0, 8);

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwOld || !pwNew) return toast.error("Lengkapi password lama & baru");
    if (pwNew !== pwConfirm) return toast.error("Konfirmasi password tidak cocok");
    if (pwNew.length < 8) return toast.error("Password minimal 8 karakter");
    changeOwnPassword();
    setPwOld("");
    setPwNew("");
    setPwConfirm("");
    toast.success("Password berhasil diubah (demo)");
  }

  function handleLogout() {
    logout();
    toast.success("Anda telah keluar");
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profile"
        description="Kelola akun, lihat hak akses, aktivitas, dan preferensi Anda."
        actions={
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge variant="outline" className="gap-1 border-success/40 bg-success/10 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {ROLE_LABEL[user.role]} · {user.department}
            </div>
            <div className="text-xs text-muted-foreground">
              {user.office} · Login terakhir:{" "}
              <span className="font-mono">{user.lastLogin ?? "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4" /> Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={UserIcon} label="Username" value={user.username} />
            <InfoRow icon={Shield} label="Employee ID" value={user.employeeId} />
            <InfoRow icon={Phone} label="Telepon" value={user.phone} />
            <InfoRow icon={MapPin} label="Lokasi Kantor" value={user.office} />
            <InfoRow icon={Building2} label="Departemen" value={user.department} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Role & Akses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary">{ROLE_LABEL[user.role]}</Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{ROLE_DESCRIPTION[user.role]}</p>
            </div>
            <Separator />
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Menu yang diizinkan ({menus.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {menus.map((m) => (
                  <Badge key={m.path} variant="outline" className="font-normal">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-success" />
                    {m.title}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Direview hari ini" value="5" />
              <Stat label="Kasus ditugaskan" value="2" />
              <Stat label="Eskalasi minggu ini" value="3" />
            </div>
            <Separator />
            {myAudit.length === 0 ? (
              <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                Belum ada aktivitas terbaru untuk akun ini.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {myAudit.map((a, i) => (
                  <li key={i} className="flex items-start justify-between text-xs">
                    <div>
                      <div className="font-medium">{a.action}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.object}</div>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{a.ts}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/audit"
              className="inline-flex text-xs text-primary hover:underline"
            >
              Lihat semua di Audit Trail →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" /> Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Login terakhir: <span className="font-mono">{user.lastLogin ?? "—"}</span>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="pw1" className="text-xs">Password lama</Label>
                <Input id="pw1" type="password" value={pwOld} onChange={(e) => setPwOld(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pw2" className="text-xs">Password baru</Label>
                <Input id="pw2" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pw3" className="text-xs">Konfirmasi password baru</Label>
                <Input id="pw3" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
              </div>
              <Button type="submit" size="sm">Ubah Password</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" /> Preferensi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tema</Label>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> Bahasa</Label>
              <div className="flex gap-1.5">
                <Button size="sm" variant={lang === "id" ? "default" : "outline"} onClick={() => setLang("id")}>
                  Bahasa Indonesia
                </Button>
                <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>
                  English
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifikasi</Label>
              <ToggleRow label="Alert kritis real-time" v={notif.alert} on={(v) => setNotif({ ...notif, alert: v })} />
              <ToggleRow label="Ringkasan mingguan" v={notif.weekly} on={(v) => setNotif({ ...notif, weekly: v })} />
              <ToggleRow label="Peringatan SLA case" v={notif.sla} on={(v) => setNotif({ ...notif, sla: v })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-2 py-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function ToggleRow({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span>{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
