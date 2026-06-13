import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DEMO_CREDENTIALS, login, useAppStore } from "@/lib/app-store";
import { defaultLanding, ROLE_LABEL } from "@/lib/rbac";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Sentinel EFRMP" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useAppStore((s) => s.session);
  const users = useAppStore((s) => s.users);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const u = users.find((x) => x.id === session.userId);
      if (u) navigate({ to: defaultLanding(u.role) as any, replace: true });
    }
  }, [session, users, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    toast.success(`Selamat datang, ${res.user.name}`);
    navigate({ to: defaultLanding(res.user.role) as any, replace: true });
  }

  function quickLogin(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    const res = login(u, p);
    if (res.ok) {
      toast.success(`Login sebagai ${res.user.name}`);
      navigate({ to: defaultLanding(res.user.role) as any, replace: true });
    } else setErr(res.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 md:flex">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">SENTINEL</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">EFRMP · v4.2</div>
              </div>
            </div>
            <h1 className="mt-10 text-3xl font-semibold tracking-tight">
              Enterprise Fraud Risk Management Platform
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Selaras dengan PADG 24/2024, POJK 11/2022, dan SE OJK 21/2024.
              Real-time monitoring, manual review, dan pelaporan regulator dalam satu konsol.
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            © 2026 Sentinel · GMT+7 · Demo environment
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Masuk ke Sentinel</CardTitle>
            <p className="text-xs text-muted-foreground">
              Gunakan akun demo di bawah, atau login manual dengan kredensial Anda.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="u">Email atau username</Label>
                <Input
                  id="u"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="andini.p"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p">Password</Label>
                <Input
                  id="p"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              {err && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {err}
                </div>
              )}
              <Button type="submit" className="w-full">
                Masuk
              </Button>
            </form>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                Quick login (demo)
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-1.5">
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.username}
                    type="button"
                    onClick={() => quickLogin(c.username, c.password)}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-xs hover:bg-accent"
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {c.username} · {c.password}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {ROLE_LABEL[c.role]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
