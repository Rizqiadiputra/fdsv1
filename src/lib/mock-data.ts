// Mock data for the EFRMP platform

export const fraudTrend = [
  { date: "Jan", fraud: 142, loss: 480, complaints: 230 },
  { date: "Feb", fraud: 168, loss: 520, complaints: 245 },
  { date: "Mar", fraud: 195, loss: 612, complaints: 280 },
  { date: "Apr", fraud: 174, loss: 580, complaints: 268 },
  { date: "May", fraud: 220, loss: 720, complaints: 305 },
  { date: "Jun", fraud: 248, loss: 845, complaints: 322 },
  { date: "Jul", fraud: 232, loss: 790, complaints: 310 },
  { date: "Aug", fraud: 268, loss: 920, complaints: 348 },
  { date: "Sep", fraud: 295, loss: 1024, complaints: 360 },
  { date: "Oct", fraud: 278, loss: 962, complaints: 342 },
  { date: "Nov", fraud: 312, loss: 1180, complaints: 388 },
  { date: "Dec", fraud: 340, loss: 1320, complaints: 412 },
];

export const fraudTypes = [
  { name: "Account Takeover", value: 312, color: "var(--color-chart-1)" },
  { name: "Money Mule", value: 248, color: "var(--color-chart-2)" },
  { name: "QRIS Fraud", value: 196, color: "var(--color-chart-3)" },
  { name: "Promo Abuse", value: 168, color: "var(--color-chart-4)" },
  { name: "Merchant Fraud", value: 142, color: "var(--color-chart-5)" },
  { name: "Synthetic Identity", value: 98, color: "var(--color-info)" },
  { name: "Insider Fraud", value: 42, color: "var(--color-warning)" },
];

export const incidentTrend = [
  { date: "W1", operational: 18, cyber: 6 },
  { date: "W2", operational: 22, cyber: 9 },
  { date: "W3", operational: 14, cyber: 4 },
  { date: "W4", operational: 28, cyber: 11 },
  { date: "W5", operational: 19, cyber: 7 },
  { date: "W6", operational: 24, cyber: 13 },
  { date: "W7", operational: 31, cyber: 8 },
  { date: "W8", operational: 26, cyber: 15 },
];

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type AlertStatus = "New" | "In Review" | "Escalated" | "Closed";

export interface Alert {
  id: string;
  ts: string;
  user: string;
  amount: number;
  score: number;
  rule: string;
  severity: Severity;
  fraudType: string;
  status: AlertStatus;
}

const fraudTypeList = [
  "Account Takeover",
  "Money Mule",
  "QRIS Fraud",
  "Promo Abuse",
  "Merchant Fraud",
  "Synthetic Identity",
];
const rules = [
  "R-1042 Velocity High Risk",
  "R-2007 New Device + High Value",
  "R-3015 VPN + Cash Out",
  "R-4002 Mule Pattern",
  "R-5031 Promo Abuse Burst",
  "R-6018 Merchant Refund Anomaly",
];

function seeded(i: number) {
  return Math.abs(Math.sin(i * 9301 + 49297) * 233280) % 1;
}

export const alerts: Alert[] = Array.from({ length: 48 }).map((_, i) => {
  const r = seeded(i);
  const sev: Severity =
    r > 0.85 ? "Critical" : r > 0.6 ? "High" : r > 0.3 ? "Medium" : "Low";
  const status: AlertStatus =
    r > 0.75 ? "Escalated" : r > 0.5 ? "In Review" : r > 0.2 ? "New" : "Closed";
  const d = new Date(Date.now() - i * 1000 * 60 * 17);
  return {
    id: `ALR-${(100245 + i).toString()}`,
    ts: d.toISOString().replace("T", " ").slice(0, 19),
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    amount: Math.floor(50_000 + r * 95_000_000),
    score: Math.floor(20 + r * 80),
    rule: rules[i % rules.length],
    severity: sev,
    fraudType: fraudTypeList[i % fraudTypeList.length],
    status,
  };
});

export type CaseStatus =
  | "Open"
  | "Assigned"
  | "Investigation"
  | "Escalated"
  | "Fraud Confirmed"
  | "False Positive"
  | "Closed";

export const cases = Array.from({ length: 22 }).map((_, i) => {
  const r = seeded(i + 100);
  const statuses: CaseStatus[] = [
    "Open",
    "Assigned",
    "Investigation",
    "Escalated",
    "Fraud Confirmed",
    "False Positive",
    "Closed",
  ];
  return {
    id: `CASE-${(20890 + i).toString()}`,
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    type: fraudTypeList[i % fraudTypeList.length],
    amount: Math.floor(100_000 + r * 75_000_000),
    status: statuses[i % statuses.length],
    assignee: ["Andini P.", "Budi S.", "Citra L.", "Dharma W.", "Eka R."][i % 5],
    age: Math.floor(r * 30) + 1,
    sla: r > 0.7 ? "Breached" : r > 0.4 ? "At Risk" : "On Track",
  };
});

export const users = Array.from({ length: 18 }).map((_, i) => {
  const r = seeded(i + 200);
  return {
    id: `USR-${(40012 + i).toString()}`,
    name: [
      "Ahmad Wijaya",
      "Siti Rahmawati",
      "Budi Santoso",
      "Dewi Lestari",
      "Eko Prasetyo",
      "Fitri Handayani",
      "Gunawan H.",
      "Hesti Mulyani",
    ][i % 8],
    phone: `+62 8${Math.floor(1000000000 + r * 8999999999)}`,
    email: `user${i + 1}@mail.id`,
    kyc: r > 0.7 ? "Tier 3" : r > 0.4 ? "Tier 2" : "Tier 1",
    score: Math.floor(10 + r * 90),
    indicators: [
      ...(r > 0.6 ? ["New Device"] : []),
      ...(r > 0.7 ? ["VPN"] : []),
      ...(r > 0.5 ? ["Velocity"] : []),
      ...(r > 0.8 ? ["Multiple Devices"] : []),
    ],
    tx: Math.floor(50 + r * 1200),
    alerts: Math.floor(r * 25),
    fraud: r > 0.85 ? Math.floor(r * 4) : 0,
  };
});

export const devices = Array.from({ length: 16 }).map((_, i) => {
  const r = seeded(i + 300);
  return {
    id: `DEV-${(70234 + i).toString()}`,
    fingerprint: `fp_${Math.floor(r * 1e16).toString(16).slice(0, 14)}`,
    os: ["Android 14", "iOS 17", "Android 13", "iOS 16"][i % 4],
    users: Math.floor(1 + r * 8),
    alerts: Math.floor(r * 20),
    fraud: r > 0.8 ? Math.floor(r * 3) : 0,
    blacklisted: r > 0.85,
    root: r > 0.75,
    emulator: r > 0.82,
  };
});

export const complaints = Array.from({ length: 14 }).map((_, i) => {
  const r = seeded(i + 400);
  return {
    id: `CMP-${(55012 + i).toString()}`,
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    tx: `TX-${(900012 + i * 17).toString()}`,
    category: ["Unauthorized Tx", "Failed Tx", "Refund", "Service", "Fraud Claim"][i % 5],
    status: ["Open", "In Progress", "Resolved", "Escalated"][i % 4],
    age: Math.floor(r * 18) + 1,
  };
});

export const rulesList = Array.from({ length: 12 }).map((_, i) => {
  const r = seeded(i + 500);
  return {
    id: `RULE-${(1001 + i).toString()}`,
    name: rules[i % rules.length],
    desc: "Trigger when transaction velocity exceeds defined threshold within rolling window.",
    severity: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    action: ["Hold", "Review", "Reject", "Notify"][i % 4],
    status: r > 0.2 ? "Active" : "Disabled",
    version: `v${Math.floor(1 + r * 6)}.${i % 9}`,
    hits: Math.floor(r * 4800),
  };
});

export const riskRegister = Array.from({ length: 10 }).map((_, i) => {
  const r = seeded(i + 600);
  return {
    id: `RSK-${(301 + i).toString()}`,
    category: [
      "Fraud",
      "Operational",
      "Cyber",
      "Compliance",
      "Reputation",
      "Liquidity",
    ][i % 6],
    title: [
      "Account Takeover Wave",
      "Settlement Delay",
      "Phishing Campaign",
      "Late OJK Submission",
      "Negative Media",
      "Vendor SLA Breach",
    ][i % 6],
    level: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    owner: ["Risk Office", "Operations", "CISO", "Compliance", "Comms", "Treasury"][i % 6],
    mitigation: ["Mitigated", "In Progress", "Open", "Monitoring"][i % 4],
  };
});

export const cyberIncidents = Array.from({ length: 12 }).map((_, i) => {
  const r = seeded(i + 700);
  return {
    id: `INC-${(80012 + i).toString()}`,
    type: [
      "Brute Force",
      "Credential Stuffing",
      "DDoS",
      "Malware",
      "Unauthorized Access",
      "Data Leakage",
    ][i % 6],
    severity: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    status: ["Open", "Triage", "Contained", "Resolved"][i % 4],
    detected: new Date(Date.now() - i * 3600_000 * 9).toISOString().slice(0, 16).replace("T", " "),
    source: ["External", "Internal", "Partner"][i % 3],
  };
});

export const auditLog = Array.from({ length: 20 }).map((_, i) => {
  const r = seeded(i + 800);
  return {
    ts: new Date(Date.now() - i * 1000 * 60 * 23).toISOString().slice(0, 19).replace("T", " "),
    user: ["andini.p", "budi.s", "citra.l", "admin", "auditor1"][i % 5],
    action: [
      "Login",
      "Rule Updated",
      "Case Assigned",
      "Blacklist Added",
      "Approval Granted",
      "Logout",
    ][i % 6],
    object: ["RULE-1004", "CASE-20893", "USR-40512", "DEV-70241", "—"][i % 5],
    before: ["Active", "Open", "—", "—", "—"][i % 5],
    after: ["Disabled", "Assigned", "Blacklisted", "Approved", "—"][i % 5],
  };
});

export const blacklists = {
  user: Array.from({ length: 8 }).map((_, i) => ({
    id: `USR-${(40512 + i).toString()}`,
    reason: "Confirmed account takeover",
    addedBy: "andini.p",
    date: "2025-05-12",
  })),
  device: Array.from({ length: 6 }).map((_, i) => ({
    id: `DEV-${(70234 + i).toString()}`,
    reason: "Emulator + multi-user",
    addedBy: "budi.s",
    date: "2025-04-29",
  })),
  merchant: Array.from({ length: 5 }).map((_, i) => ({
    id: `MCH-${(33012 + i).toString()}`,
    reason: "Refund abuse",
    addedBy: "citra.l",
    date: "2025-05-02",
  })),
  account: Array.from({ length: 7 }).map((_, i) => ({
    id: `ACC-${(900012 + i).toString()}`,
    reason: "Mule account",
    addedBy: "dharma.w",
    date: "2025-05-18",
  })),
  ip: Array.from({ length: 6 }).map((_, i) => ({
    id: `103.45.${i + 10}.${i * 7}`,
    reason: "TOR exit node",
    addedBy: "system",
    date: "2025-05-21",
  })),
};

export const regulatoryReports = [
  { id: "OJK-2025-Q2-001", name: "OJK Fraud Quarterly Report Q2 2025", regulator: "OJK", period: "Q2 2025", status: "Submitted", due: "2025-07-15" },
  { id: "BI-2025-06-014", name: "BI Operational Incident June 2025", regulator: "Bank Indonesia", period: "Jun 2025", status: "Draft", due: "2025-07-05" },
  { id: "OJK-2025-Q2-002", name: "Consumer Complaint Summary", regulator: "OJK", period: "Q2 2025", status: "Submitted", due: "2025-07-15" },
  { id: "AUD-2025-H1", name: "Internal Audit Half-Year", regulator: "Internal", period: "H1 2025", status: "In Review", due: "2025-07-30" },
  { id: "MGT-2025-06", name: "Management Risk Dashboard", regulator: "Internal", period: "Jun 2025", status: "Submitted", due: "2025-07-03" },
  { id: "BI-2025-Q2-003", name: "BI Fraud Reporting Q2", regulator: "Bank Indonesia", period: "Q2 2025", status: "Pending", due: "2025-07-20" },
];

export const mlModels = [
  { name: "ATO Detection v3.2", accuracy: 0.964, precision: 0.918, recall: 0.882, f1: 0.9, fpr: 0.021 },
  { name: "Mule Network v2.1", accuracy: 0.948, precision: 0.892, recall: 0.864, f1: 0.878, fpr: 0.034 },
  { name: "Promo Abuse v1.8", accuracy: 0.973, precision: 0.945, recall: 0.91, f1: 0.927, fpr: 0.018 },
  { name: "Synthetic ID v1.3", accuracy: 0.921, precision: 0.86, recall: 0.83, f1: 0.845, fpr: 0.042 },
];

export const anomalyAlerts = Array.from({ length: 8 }).map((_, i) => {
  const r = seeded(i + 900);
  return {
    id: `ANO-${(60012 + i).toString()}`,
    entity: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    type: ["Behavioral", "Device", "Transaction"][i % 3],
    score: (0.7 + r * 0.3).toFixed(3),
    model: ["ATO Detection v3.2", "Mule Network v2.1", "Promo Abuse v1.8"][i % 3],
    ts: new Date(Date.now() - i * 3600_000 * 5).toISOString().slice(0, 16).replace("T", " "),
  };
});

export const adminUsers = [
  { name: "Andini Putri", email: "andini.p@bank.id", role: "Fraud Analyst", status: "Active", lastLogin: "2025-06-05 09:12" },
  { name: "Budi Santoso", email: "budi.s@bank.id", role: "Fraud Investigator", status: "Active", lastLogin: "2025-06-05 08:44" },
  { name: "Citra Lestari", email: "citra.l@bank.id", role: "Fraud Manager", status: "Active", lastLogin: "2025-06-04 17:30" },
  { name: "Dharma Wibowo", email: "dharma.w@bank.id", role: "Compliance Officer", status: "Active", lastLogin: "2025-06-05 07:50" },
  { name: "Eka Rahayu", email: "eka.r@bank.id", role: "Auditor", status: "Active", lastLogin: "2025-06-03 14:21" },
  { name: "Fajar Nugraha", email: "fajar.n@bank.id", role: "Cyber Security Analyst", status: "Active", lastLogin: "2025-06-05 10:05" },
  { name: "Gita Maharani", email: "gita.m@bank.id", role: "Administrator", status: "Active", lastLogin: "2025-06-05 09:58" },
];

export function fmtIDR(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)} B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)} M`;
  if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} K`;
  return `Rp ${n}`;
}

export function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
