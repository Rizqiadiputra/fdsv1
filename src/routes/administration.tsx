import { createFileRoute } from "@tanstack/react-router";
import { Users, Shield, Building2, Key } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminUsers } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/severity-badge";

export const Route = createFileRoute("/administration")({
  head: () => ({ meta: [{ title: "Administration — Sentinel EFRMP" }] }),
  component: AdminPage,
});

const roles = [
  { name: "Fraud Analyst", users: 24, perms: 12 },
  { name: "Fraud Investigator", users: 18, perms: 18 },
  { name: "Fraud Manager", users: 6, perms: 26 },
  { name: "Compliance Officer", users: 4, perms: 22 },
  { name: "Auditor", users: 3, perms: 8 },
  { name: "Cyber Security Analyst", users: 8, perms: 16 },
  { name: "Administrator", users: 2, perms: 42 },
];

const tenants = [
  { name: "PT BankXYZ Digital", code: "BXD", users: 142, status: "Active" },
  { name: "BankXYZ E-Wallet", code: "BXE", users: 86, status: "Active" },
  { name: "BankXYZ PSP", code: "BXP", users: 38, status: "Active" },
  { name: "BankXYZ Lending", code: "BXL", users: 24, status: "Active" },
];

function AdminPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Administration"
        description="Role-Based Access Control, multi-tenant management, and enterprise security policies."
        actions={<Button size="sm">+ Invite User</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Users" value="65" icon={<Users className="h-4 w-4" />} tone="info" />
        <KpiCard label="Roles" value="7" icon={<Shield className="h-4 w-4" />} tone="default" />
        <KpiCard label="Tenants" value="4" icon={<Building2 className="h-4 w-4" />} tone="success" />
        <KpiCard label="Active Sessions" value="42" hint="MFA enforced" icon={<Key className="h-4 w-4" />} tone="success" />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="security">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Platform Users</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((u) => (
                    <TableRow key={u.email} className="hover:bg-muted/40">
                      <TableCell className="text-xs font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{u.role}</Badge></TableCell>
                      <TableCell><SeverityBadge value={u.status} /></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <Card key={r.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <CardDescription>{r.users} users · {r.perms} permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">Manage Permissions</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Tenant</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t) => (
                    <TableRow key={t.code} className="hover:bg-muted/40">
                      <TableCell className="text-xs font-medium">{t.name}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-[10px]">{t.code}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-xs">{t.users}</TableCell>
                      <TableCell><SeverityBadge value={t.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: "Multi-Factor Authentication", value: "Enforced (TOTP + WebAuthn)", state: "Active" },
              { name: "Password Policy", value: "12+ chars, rotation 90d", state: "Active" },
              { name: "IP Allowlist", value: "Corp VPN ranges only", state: "Active" },
              { name: "Session Timeout", value: "15 minutes idle", state: "Active" },
              { name: "SSO", value: "SAML 2.0 / OIDC", state: "Active" },
              { name: "Field-Level Encryption", value: "AES-256-GCM (KMS-managed)", state: "Active" },
            ].map((p) => (
              <Card key={p.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.value}</div>
                  </div>
                  <SeverityBadge value={p.state} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
