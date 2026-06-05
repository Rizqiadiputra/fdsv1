import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  invertDelta?: boolean;
}

const toneMap = {
  default: "from-primary/15 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/15 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
  info: "from-info/15 to-info/0 text-info",
};

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "default",
  invertDelta = false,
}: KpiCardProps) {
  const positive = delta !== undefined ? delta >= 0 : null;
  const good = invertDelta ? !positive : positive;
  return (
    <Card className="relative overflow-hidden border-border/80 p-4">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          toneMap[tone].split(" ")[0].replace("from-", "from-"),
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 truncate font-mono text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {(delta !== undefined || hint) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {delta !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium",
                    good
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {positive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              )}
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
              toneMap[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
