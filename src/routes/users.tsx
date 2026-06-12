import { createFileRoute } from "@tanstack/react-router";
import { Users as UsersIcon, ShieldAlert, UserX, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { users, fmtNum } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "User Intelligence — Sentinel EFRMP" }] }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="User Intelligence"
        description="Customer risk profiles, behavioral indicators, and historical fraud signals."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Users" value={fmtNum(2814902)} delta={2.1} icon={<UsersIcon className="h-4 w-4" />} tone="info" />
        <KpiCard label="High-Risk Profiles" value="3,412" delta={6.4} icon={<ShieldAlert className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Blacklisted Users" value="248" delta={1.2} icon={<UserX className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Velocity Anomalies" value="184" delta={-4.5} icon={<Activity className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">User Risk Repository</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search user, phone, email…" className="h-8 w-[260px]" />
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="w-[180px]">Risk Score</TableHead>
                  <TableHead>Indicators</TableHead>
                  <TableHead className="text-right">Tx</TableHead>
                  <TableHead className="text-right">Alerts</TableHead>
                  <TableHead className="text-right">Fraud</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                    <TableCell className="text-xs">{u.name}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{u.nik}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        u.internalFlag === "Internal"
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-info/30 bg-info/10 text-info",
                      )}>{u.internalFlag}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.phone}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{u.kyc}</Badge></TableCell>
                    <TableCell><RiskMeter score={u.score} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.indicators.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          u.indicators.map((i) => (
                            <Badge key={i} variant="outline" className="border-warning/30 bg-warning/10 text-[10px] text-warning">
                              {i}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{u.tx}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{u.alerts}</TableCell>
                    <TableCell className={cn("text-right font-mono text-xs", u.fraud > 0 && "font-semibold text-destructive")}>
                      {u.fraud}
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

function RiskMeter({ score }: { score: number }) {
  const tone =
    score >= 81 ? "bg-critical" : score >= 61 ? "bg-destructive" : score >= 31 ? "bg-warning" : "bg-success";
  const label =
    score >= 81 ? "Reject" : score >= 61 ? "Hold" : score >= 31 ? "Review" : "Approve";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", tone)} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs">{score}</span>
      <span className="text-[10px] text-muted-foreground">· {label}</span>
    </div>
  );
}
