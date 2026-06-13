import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Pencil, KeyRound, Power, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  addUser,
  resetUserPassword,
  updateUser,
  useAppStore,
  type AppUser,
} from "@/lib/app-store";
import {
  ROLE_LABEL,
  ROLE_DESCRIPTION,
  listAllowedMenus,
  type Role,
} from "@/lib/rbac";

export const Route = createFileRoute("/account-management")({
  head: () => ({ meta: [{ title: "Account Management — Sentinel EFRMP" }] }),
  component: AccountMgmt,
});

const ROLES: Role[] = ["manager", "analyst", "compliance", "cs", "admin"];

function AccountMgmt() {
  const users = useAppStore((s) => s.users);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<AppUser | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Account Management"
        description="Kelola user, role, dan akses RBAC. Setiap perubahan tercatat di Audit Trail."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4" /> Tambah User
              </Button>
            </DialogTrigger>
            <AddUserDialog onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar User ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{u.id} · {u.username}</div>
                  </TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{ROLE_LABEL[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{u.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.status === "Aktif"
                          ? "border-success/40 bg-success/10 text-success text-[10px]"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground text-[10px]"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {u.lastLogin ?? "—"}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEdit(u)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        resetUserPassword(u.id);
                        toast.success(`Reset password dikirim ke ${u.email}`);
                      }}
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const next = u.status === "Aktif" ? "Nonaktif" : "Aktif";
                        updateUser(u.id, { status: next });
                        toast.success(`${u.name} → ${next}`);
                      }}
                    >
                      <Power className="h-3.5 w-3.5" /> {u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> RBAC — Matrix Role
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {ROLES.map((r) => {
            const menus = listAllowedMenus(r);
            return (
              <div key={r} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{ROLE_LABEL[r]}</div>
                  <Badge variant="outline" className="text-[10px]">{menus.length} menu</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTION[r]}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {menus.map((m) => (
                    <span key={m.path} className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px]">
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {edit && <EditUserDialog user={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function AddUserDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("analyst");
  const [department, setDepartment] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !username || !department) {
      toast.error("Lengkapi semua field");
      return;
    }
    const u = addUser({
      name,
      email,
      username,
      role,
      department,
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 89999)}`,
      phone: "+62 812-0000-0000",
      office: "HQ Jakarta",
    });
    toast.success(`User ${u.name} ditambahkan`);
    onClose();
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Tambah User Baru</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nama lengkap"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Username"><Input value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
        <Field label="Role">
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Departemen"><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit">Simpan</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditUserDialog({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const [role, setRole] = useState<Role>(user.role);
  const [department, setDepartment] = useState(user.department);
  const [status, setStatus] = useState<AppUser["status"]>(user.status);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    updateUser(user.id, { role, department, status });
    toast.success(`${user.name} diperbarui`);
    onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User · {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Departemen"><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></Field>
          <Field label="Status">
            <Select value={status} onValueChange={(v) => setStatus(v as AppUser["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
