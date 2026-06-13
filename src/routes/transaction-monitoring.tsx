import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock, ShieldAlert, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { liveTransactions, fmtIDR, type LiveTx } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transaction-monitoring")({
  head: () => ({
    meta: [
      { title: "Real-Time Transaction Monitoring — Sentinel EFRMP" },
      { name: "description", content: "Live transaction stream for Indonesian e-wallet channels with risk scoring and decisioning." },
    ],
  }),
  component: TxMonitoring,
});

function TxMonitoring() {
  const [items, setItems] = useState<LiveTx[]>(liveTransactions);
  const [tps, setTps] = useState(842);
  const [lastPoll, setLastPoll] = useState<string>(new Date().toLocaleTimeString("id-ID"));

  useEffect(() => {
    // Polling refresh — backend tetap mengukur SLA <500ms; UI hanya
    // me-refresh tabel setiap 4 detik agar tidak membanjiri front-end.
    const t = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const head = next[0];
        if (head) {
          const newItem: LiveTx = {
            ...head,
            id: `TX-${Math.floor(Math.random() * 1e7).toString()}`,
            ts: new Date().toISOString().slice(11, 19),
          };
          next.unshift(newItem);
          next.pop();
        }
        return next;
      });
      setTps((v) => Math.max(600, Math.min(1200, v + Math.floor(Math.random() * 40 - 20))));
      setLastPoll(new Date().toLocaleTimeString("id-ID"));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Real-Time Transaction Monitoring"
        description="Streaming decision engine across QRIS, P2P, TopUp, Bill Payment, and Cash Out channels for Indonesian e-wallets."
        actions={
          <>
            <Select defaultValue="all">
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                <SelectItem value="gopay">GoPay</SelectItem>
                <SelectItem value="ovo">OVO</SelectItem>
                <SelectItem value="dana">DANA</SelectItem>
                <SelectItem value="shopeepay">ShopeePay</SelectItem>
                <SelectItem value="linkaja">LinkAja</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">Pause Stream</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="Transactions / sec" value={tps.toString()} delta={3.2} icon={<Zap className="h-4 w-4" />} tone="info" />
        <KpiCard label="Approved" value="98.42%" delta={0.18} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <KpiCard label="Hold / Review" value="1.34%" delta={-0.12} icon={<Clock className="h-4 w-4" />} tone="warning" invertDelta />
        <KpiCard label="Rejected" value="0.24%" delta={-0.06} icon={<ShieldAlert className="h-4 w-4" />} tone="destructive" invertDelta />
        <KpiCard label="Avg Decision Latency" value="42 ms" delta={-5.4} icon={<Activity className="h-4 w-4" />} tone="success" invertDelta />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Live Decision Stream</CardTitle>
              <CardDescription>Polling tiap 4 detik · backend SLA &lt;500ms · last refresh {lastPoll}</CardDescription>
            </div>
            <Badge variant="outline" className="border-info/40 bg-info/10 text-info">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-info" /> Polling
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[560px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Tx ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Mata Uang</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Saldo Tertahan</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs text-muted-foreground">{t.ts}</TableCell>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.wallet}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{t.user}</TableCell>
                    <TableCell className="text-xs">{t.userName}</TableCell>
                    <TableCell className="text-xs">{t.channel}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.merchant ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtIDR(t.amount)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{t.currency}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-xs",
                        t.score >= 85 ? "bg-destructive/15 text-destructive" :
                        t.score >= 70 ? "bg-warning/15 text-warning" :
                        t.score >= 50 ? "bg-info/15 text-info" :
                        "bg-success/15 text-success",
                      )}>{t.score}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        t.decision === "Approved" && "border-success/40 bg-success/10 text-success",
                        t.decision === "Review" && "border-info/40 bg-info/10 text-info",
                        t.decision === "Hold" && "border-warning/40 bg-warning/10 text-warning",
                        t.decision === "Rejected" && "border-destructive/40 bg-destructive/10 text-destructive",
                      )}>{t.decision}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        t.source === "Sumsub" ? "border-info/40 bg-info/10 text-info" : "border-success/40 bg-success/10 text-success",
                      )}>{t.source}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {t.heldAmount > 0 ? fmtIDR(t.heldAmount) : "—"}
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
