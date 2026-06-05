import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  Critical: "bg-critical/15 text-critical border-critical/30",
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Low: "bg-info/15 text-info border-info/30",
  Active: "bg-success/15 text-success border-success/30",
  Disabled: "bg-muted text-muted-foreground border-border",
  Resolved: "bg-success/15 text-success border-success/30",
  Open: "bg-info/15 text-info border-info/30",
  Closed: "bg-muted text-muted-foreground border-border",
  New: "bg-info/15 text-info border-info/30",
  Escalated: "bg-critical/15 text-critical border-critical/30",
  "In Review": "bg-warning/15 text-warning border-warning/30",
  "In Progress": "bg-warning/15 text-warning border-warning/30",
  Assigned: "bg-info/15 text-info border-info/30",
  Investigation: "bg-warning/15 text-warning border-warning/30",
  "Fraud Confirmed": "bg-critical/15 text-critical border-critical/30",
  "False Positive": "bg-muted text-muted-foreground border-border",
  Submitted: "bg-success/15 text-success border-success/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Breached: "bg-destructive/15 text-destructive border-destructive/30",
  "At Risk": "bg-warning/15 text-warning border-warning/30",
  "On Track": "bg-success/15 text-success border-success/30",
  Mitigated: "bg-success/15 text-success border-success/30",
  Monitoring: "bg-info/15 text-info border-info/30",
  Triage: "bg-warning/15 text-warning border-warning/30",
  Contained: "bg-info/15 text-info border-info/30",
};

export function SeverityBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", map[value] ?? "")}>
      {value}
    </Badge>
  );
}
