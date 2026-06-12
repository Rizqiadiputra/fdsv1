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
  { name: "Wallet Transfer Burst", value: 142, color: "var(--color-chart-5)" },
  { name: "SIM Swap", value: 98, color: "var(--color-info)" },
  { name: "Synthetic Identity", value: 64, color: "var(--color-warning)" },
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
  userName: string;
  amount: number;
  score: number;
  rule: string;
  rulesTriggered: string[];
  severity: Severity;
  fraudType: string;
  status: AlertStatus;
  location: string;
}

const fraudTypeList = [
  "Account Takeover",
  "Money Mule",
  "QRIS Fraud",
  "Promo Abuse",
  "Wallet Transfer Burst",
  "SIM Swap",
  "Synthetic Identity",
];
const rules = [
  "R-1042 New Device + Cash Out",
  "R-2007 Multiple QRIS Payments",
  "R-3015 Wallet Transfer Burst",
  "R-4002 Money Mule Pattern",
  "R-5031 Promo Abuse Burst",
  "R-6018 SIM Swap Indicator",
  "R-7022 Account Takeover Signal",
];

function seeded(i: number) {
  return Math.abs(Math.sin(i * 9301 + 49297) * 233280) % 1;
}

// E-wallet tiered amount picker. Most tx are micro/normal; only flagged fraud
// can exceed the Rp 20.000.000 ceiling.
function ewalletAmount(r: number, fraudFlag = false): number {
  if (fraudFlag && r > 0.92) return Math.floor(20_000_000 + r * 80_000_000); // abnormal fraud
  if (r > 0.95) return Math.floor(5_000_000 + r * 15_000_000);  // critical 5-20M
  if (r > 0.85) return Math.floor(2_000_000 + r * 3_000_000);   // high 2-5M
  if (r > 0.65) return Math.floor(500_000 + r * 1_500_000);     // medium 0.5-2M
  if (r > 0.35) return Math.floor(100_000 + r * 400_000);       // normal 100K-500K
  return Math.floor(10_000 + r * 90_000);                       // micro 10K-100K
}

const userNames = ["Ahmad Wijaya","Siti Rahmawati","Budi Santoso","Dewi Lestari","Eko Prasetyo","Fitri Handayani","Gunawan H.","Hesti Mulyani"];
const idLocations = ["Jakarta Pusat","Bandung","Surabaya","Medan","Denpasar","Makassar","Semarang","Yogyakarta","Tangerang","Bekasi"];

export const alerts: Alert[] = Array.from({ length: 48 }).map((_, i) => {
  const r = seeded(i);
  const sev: Severity =
    r > 0.85 ? "Critical" : r > 0.6 ? "High" : r > 0.3 ? "Medium" : "Low";
  const status: AlertStatus =
    r > 0.75 ? "Escalated" : r > 0.5 ? "In Review" : r > 0.2 ? "New" : "Closed";
  const d = new Date(Date.now() - i * 1000 * 60 * 17);
  const triggeredCount = r > 0.75 ? 3 : r > 0.45 ? 2 : 1;
  const rulesTriggered = Array.from({ length: triggeredCount }).map(
    (_, k) => rules[(i + k * 2) % rules.length],
  );
  return {
    id: `ALR-${(100245 + i).toString()}`,
    ts: d.toISOString().replace("T", " ").slice(0, 19),
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    userName: userNames[i % userNames.length],
    amount: ewalletAmount(r, sev === "Critical"),
    score: Math.floor(20 + r * 80),
    rule: rules[i % rules.length],
    rulesTriggered,
    severity: sev,
    fraudType: fraudTypeList[i % fraudTypeList.length],
    status,
    location: idLocations[i % idLocations.length],
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

const caseLocations = ["Jakarta Pusat","Bandung","Surabaya","Medan","Denpasar","Makassar","Semarang","Yogyakarta","Tangerang","Bekasi","Palembang","Pekanbaru"];
const caseDivisions = ["Fraud Ops","Risk Management","Compliance","Cyber Security","Consumer Protection","Branch Banking","Digital Channel"];
const caseRecs = [
  "Blacklist wallet & device, lapor SKNBI, edukasi nasabah.",
  "Tahan saldo, eskalasi ke Cyber Security, koordinasi dengan bank rekanan.",
  "Refund nasabah, perbarui rule R-1042, audit merchant terkait.",
  "Investigasi lanjutan, koordinasi PPATK & Bareskrim.",
  "Tutup wallet, freeze rekening tujuan, klaim asuransi fraud.",
  "Monitoring 30 hari, kuatkan parameter velocity.",
];

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
  const amount = ewalletAmount(r, statuses[i % statuses.length] === "Fraud Confirmed");
  const recovered = statuses[i % statuses.length] === "Fraud Confirmed"
    ? Math.floor(amount * (0.2 + r * 0.5))
    : statuses[i % statuses.length] === "Closed" ? Math.floor(amount * (0.4 + r * 0.4)) : 0;
  return {
    id: `CASE-${(20890 + i).toString()}`,
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    type: fraudTypeList[i % fraudTypeList.length],
    amount,
    lossAmount: amount,
    recoveredAmount: recovered,
    location: caseLocations[i % caseLocations.length],
    perpetratorAccount: `${["GoPay","OVO","DANA","ShopeePay","LinkAja"][i % 5]} ${(8121000000 + Math.floor(r * 999999999)).toString().slice(0,12)}`,
    division: caseDivisions[i % caseDivisions.length],
    recommendation: caseRecs[i % caseRecs.length],
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
    nik: `32${(73010100000000 + Math.floor(r * 99999999999)).toString().slice(0, 14)}`,
    internalFlag: i % 9 === 0 ? "Internal" : "Eksternal",
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

function fmtDateTime(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const cyberIncidents = Array.from({ length: 12 }).map((_, i) => {
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
    detected: fmtDateTime(new Date(Date.now() - (i + 1) * 3600_000 * 9)),
    source: ["External", "Internal", "Partner"][i % 3],
  };
});

// Sensitive/regulated audit actions that must keep full before/after snapshots.
export const SENSITIVE_AUDIT_ACTIONS = new Set<string>([
  "Rule Updated",
  "Case Status Changed",
  "Case Assigned",
  "Blacklist Added",
  "Parameter Updated",
  "Approval Granted",
]);

const auditActionPool = [
  "Login",
  "Rule Updated",
  "Case Assigned",
  "Blacklist Added",
  "Approval Granted",
  "Logout",
  "Parameter Updated",
  "Case Status Changed",
  "Dashboard Viewed",
  "Report Exported",
];

export const auditLog = Array.from({ length: 22 }).map((_, i) => {
  const action = auditActionPool[i % auditActionPool.length];
  const sensitive = SENSITIVE_AUDIT_ACTIONS.has(action);
  return {
    ts: fmtDateTime(new Date(Date.now() - (i + 1) * 1000 * 60 * 23)),
    user: ["andini.p", "budi.s", "citra.l", "admin", "auditor1"][i % 5],
    action,
    object: ["RULE-1004", "CASE-20893", "USR-40512", "DEV-70241", "PARAM-MAX_DAILY"][i % 5],
    sensitive,
    before: sensitive ? ["Active", "Open", "—", "Rp 2.000.000", "Pending"][i % 5] : null,
    after: sensitive ? ["Disabled", "Assigned", "Blacklisted", "Rp 5.000.000", "Approved"][i % 5] : null,
    summary: sensitive ? null : `field "${["session","filter","report_type","page","view"][i % 5]}" diubah`,
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
  { id: "OJK-2025-S1-001", name: "OJK Fraud Semester I 2025", regulator: "OJK", period: "Semester I 2025", status: "Submitted", due: "2025-07-31", version: 2, revisionDate: "2025-08-12" },
  { id: "BI-2025-06-014", name: "BI Operational Incident June 2025", regulator: "Bank Indonesia", period: "Jun 2025", status: "Draft", due: "2025-07-05", version: 1, revisionDate: "—" },
  { id: "OJK-2025-Q2-002", name: "Consumer Complaint Summary", regulator: "OJK", period: "Q2 2025", status: "Submitted", due: "2025-07-15", version: 1, revisionDate: "—" },
  { id: "AUD-2025-H1", name: "Internal Audit Half-Year", regulator: "Internal", period: "H1 2025", status: "In Review", due: "2025-07-30", version: 3, revisionDate: "2025-08-05" },
  { id: "MGT-2025-06", name: "Management Risk Dashboard", regulator: "Internal", period: "Jun 2025", status: "Submitted", due: "2025-07-03", version: 1, revisionDate: "—" },
  { id: "BI-2025-Q2-003", name: "BI Fraud Reporting Q2", regulator: "Bank Indonesia", period: "Q2 2025", status: "Pending", due: "2025-07-20", version: 1, revisionDate: "—" },
  { id: "TIKMI-2025-S1", name: "TIKMI Self-Assessment / SBP / RBSP", regulator: "Bank Indonesia", period: "Semester I 2025", status: "In Review", due: "2025-08-15", version: 1, revisionDate: "—" },
];

// Executive dashboard absolute counts (companion to % in Real-Time Tx Monitoring)
export const decisionCounts = {
  approved: 47_823_412,
  underReview: 654_215,
  rejected: 117_336,
};

export const vaPentestTracker = [
  { item: "DC", activity: "DC Operational Review", status: "Active", lastDate: "2025-04-22", nextDate: "2025-10-22", finding: "All systems nominal", remediation: "—", pic: "Infra Ops" },
  { item: "DRC", activity: "DRC Sync Validation", status: "Active", lastDate: "2025-05-14", nextDate: "2025-11-14", finding: "Replication lag 2.4s — within SLA", remediation: "—", pic: "Infra Ops" },
  { item: "DR Drill", activity: "Full DR Failover Drill", status: "Done", lastDate: "2025-03-08", nextDate: "2025-09-08", finding: "RTO 14m / RPO 1m — meet target", remediation: "Closed", pic: "BCM Team" },
  { item: "VA", activity: "Vulnerability Assessment (Internal)", status: "Done", lastDate: "2025-04-30", nextDate: "2025-07-30", finding: "3 medium, 1 high (TLS config)", remediation: "In Progress", pic: "Cyber Security" },
  { item: "VA", activity: "Vulnerability Assessment (External)", status: "Scheduled", lastDate: "2025-01-25", nextDate: "2025-07-25", finding: "—", remediation: "—", pic: "Cyber Security" },
  { item: "Pentest", activity: "Pentest Mobile App (Black-box)", status: "Done", lastDate: "2025-05-20", nextDate: "2025-11-20", finding: "2 high, 4 medium (OWASP M4/M7)", remediation: "In Progress", pic: "AppSec" },
  { item: "Pentest", activity: "Pentest API Gateway (Grey-box)", status: "Done", lastDate: "2025-06-02", nextDate: "2025-12-02", finding: "1 critical (auth bypass) — patched", remediation: "Closed", pic: "AppSec" },
  { item: "Pentest", activity: "Pentest Internal Network", status: "Scheduled", lastDate: "2024-12-10", nextDate: "2025-07-10", finding: "—", remediation: "—", pic: "Cyber Security" },
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

// ============ Indonesian E-Wallet specific data ============

export const ewalletProviders = ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"];

// Realistic e-wallet single-tx tiers (in IDR)
export const idrAmounts = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

export interface LiveTx {
  id: string;
  ts: string;
  user: string;
  channel: string;
  wallet: string;
  amount: number;
  merchant?: string;
  score: number;
  decision: "Approved" | "Review" | "Hold" | "Rejected";
  fraudType?: string;
}

const channels = ["QRIS Payment", "P2P Transfer", "TopUp", "Bill Payment", "Merchant Payout", "Cash Out"];
const merchants = [
  "Indomaret #4521", "Alfamart #8812", "Tokopedia Seller", "Shopee Mall",
  "Warung Bu Tini", "Grab Driver", "Gojek Driver", "Starbucks Senayan",
  "SPBU Pertamina", "PLN Prabayar", "Telkomsel Pulsa",
];

export const liveTransactions: LiveTx[] = Array.from({ length: 32 }).map((_, i) => {
  const r = seeded(i + 1100);
  const score = Math.floor(10 + r * 90);
  // Most live tx are micro/normal; only fraud-flagged tx skew higher
  const baseAmount = idrAmounts[Math.floor(r * idrAmounts.length)];
  const amount = r > 0.9 && score >= 85 ? Math.floor(5_000_000 + r * 12_000_000) : baseAmount;
  const decision: LiveTx["decision"] =
    score >= 85 ? "Rejected" : score >= 70 ? "Hold" : score >= 50 ? "Review" : "Approved";
  return {
    id: `TX-${(900012 + i * 7).toString()}`,
    ts: new Date(Date.now() - i * 1000 * 11).toISOString().replace("T", " ").slice(11, 19),
    user: `USR-${(40012 + Math.floor(r * 8000)).toString()}`,
    channel: channels[i % channels.length],
    wallet: ewalletProviders[i % ewalletProviders.length],
    amount,
    merchant: i % 3 === 0 ? merchants[i % merchants.length] : undefined,
    score,
    decision,
    fraudType: score >= 70 ? fraudTypeList[i % fraudTypeList.length] : undefined,
  };
});

export const merchantsList = Array.from({ length: 14 }).map((_, i) => {
  const r = seeded(i + 1200);
  return {
    id: `MCH-${(33012 + i).toString()}`,
    name: merchants[i % merchants.length],
    mcc: ["5411", "5812", "5732", "4900", "4814", "5541"][i % 6],
    category: ["Convenience", "F&B", "Electronics", "Utility", "Telco", "Fuel"][i % 6],
    risk: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    tx30d: Math.floor(200 + r * 9500),
    gmv30d: Math.floor(20_000_000 + r * 1_500_000_000),
    chargebackRate: (r * 4.5).toFixed(2),
    refundRate: (r * 6.2).toFixed(2),
    qrisStatic: r > 0.5,
    flag: r > 0.8 ? "Refund Abuse" : r > 0.6 ? "Velocity Spike" : "—",
  };
});

export const ekycCases = Array.from({ length: 14 }).map((_, i) => {
  const r = seeded(i + 1300);
  return {
    id: `KYC-${(70012 + i).toString()}`,
    name: ["Ahmad W.", "Siti R.", "Budi S.", "Dewi L.", "Eko P.", "Fitri H."][i % 6],
    nik: `32${Math.floor(7300000000 + r * 999999999).toString().slice(0, 14)}`,
    selfieMatch: (60 + r * 39).toFixed(1),
    liveness: r > 0.3 ? "Pass" : "Fail",
    dukcapil: r > 0.2 ? "Matched" : "Mismatch",
    deviceReuse: Math.floor(r * 6),
    blacklistHit: r > 0.85,
    risk: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    status: ["Pending", "Approved", "Rejected", "Manual Review"][i % 4],
  };
});

export const behaviorMetrics = [
  { hour: "00", txn: 120, anomaly: 4 },
  { hour: "03", txn: 78, anomaly: 8 },
  { hour: "06", txn: 245, anomaly: 6 },
  { hour: "09", txn: 612, anomaly: 12 },
  { hour: "12", txn: 845, anomaly: 18 },
  { hour: "15", txn: 720, anomaly: 14 },
  { hour: "18", txn: 980, anomaly: 22 },
  { hour: "21", txn: 540, anomaly: 11 },
];

export const threatIntel = Array.from({ length: 10 }).map((_, i) => {
  const r = seeded(i + 1400);
  return {
    id: `TI-${(20012 + i).toString()}`,
    type: ["Phishing Kit", "Stolen Credentials", "Mule-as-a-Service", "Fake App", "SIM Swap Ring", "OTP Bot"][i % 6],
    source: ["Telegram", "Dark Web", "WhatsApp", "Forum", "Honeypot"][i % 5],
    target: ewalletProviders[i % ewalletProviders.length],
    confidence: r > 0.66 ? "High" : r > 0.33 ? "Medium" : "Low",
    severity: (["Critical", "High", "Medium", "Low"] as Severity[])[i % 4],
    seen: new Date(Date.now() - i * 3600_000 * 7).toISOString().slice(0, 16).replace("T", " "),
  };
});

export const fraudParameters = [
  { key: "MAX_DAILY_TX_AMOUNT", label: "Max Daily Tx (Tier 1)", value: "Rp 2.000.000", category: "Limit", owner: "Risk" },
  { key: "MAX_DAILY_TX_AMOUNT_T2", label: "Max Daily Tx (Tier 2)", value: "Rp 20.000.000", category: "Limit", owner: "Risk" },
  { key: "MAX_DAILY_TX_AMOUNT_T3", label: "Max Daily Tx (Tier 3)", value: "Rp 100.000.000", category: "Limit", owner: "Risk" },
  { key: "VELOCITY_WINDOW_MIN", label: "Velocity Window (min)", value: "10", category: "Velocity", owner: "Fraud" },
  { key: "VELOCITY_MAX_COUNT", label: "Velocity Max Count", value: "8", category: "Velocity", owner: "Fraud" },
  { key: "NEW_DEVICE_COOLDOWN_H", label: "New Device Cooldown (h)", value: "24", category: "Device", owner: "Fraud" },
  { key: "QRIS_MAX_SINGLE_TX", label: "QRIS Max Single Tx", value: "Rp 10.000.000", category: "QRIS", owner: "Risk" },
  { key: "STEP_UP_SCORE", label: "Step-up Auth Score", value: "65", category: "Auth", owner: "Fraud" },
  { key: "AUTO_HOLD_SCORE", label: "Auto Hold Score", value: "80", category: "Auth", owner: "Fraud" },
  { key: "MULE_REL_DEPTH", label: "Mule Network Depth", value: "3", category: "Network", owner: "Fraud" },
  { key: "PROMO_MAX_CLAIM_DAY", label: "Promo Max Claim / Day", value: "3", category: "Promo", owner: "Marketing" },
  { key: "COMPLAINT_SLA_HOURS", label: "Complaint SLA (h)", value: "48", category: "Consumer", owner: "Compliance" },
];

export const lossRatioTrend = [
  { m: "Jan", gmv: 14200, loss: 1.42, target: 2.0 },
  { m: "Feb", gmv: 15100, loss: 1.65, target: 2.0 },
  { m: "Mar", gmv: 15800, loss: 1.88, target: 2.0 },
  { m: "Apr", gmv: 15400, loss: 1.74, target: 2.0 },
  { m: "May", gmv: 16700, loss: 2.10, target: 2.0 },
  { m: "Jun", gmv: 17900, loss: 1.96, target: 2.0 },
  { m: "Jul", gmv: 18200, loss: 1.82, target: 2.0 },
  { m: "Aug", gmv: 18900, loss: 1.71, target: 2.0 },
  { m: "Sep", gmv: 19400, loss: 1.65, target: 2.0 },
  { m: "Oct", gmv: 20100, loss: 1.58, target: 2.0 },
  { m: "Nov", gmv: 21200, loss: 1.49, target: 2.0 },
  { m: "Dec", gmv: 22400, loss: 1.42, target: 2.0 },
];

export const complaintRatioTrend = [
  { m: "Jan", tx: 38, complaints: 0.038, target: 0.05 },
  { m: "Feb", tx: 39, complaints: 0.041, target: 0.05 },
  { m: "Mar", tx: 41, complaints: 0.046, target: 0.05 },
  { m: "Apr", tx: 40, complaints: 0.044, target: 0.05 },
  { m: "May", tx: 43, complaints: 0.051, target: 0.05 },
  { m: "Jun", tx: 45, complaints: 0.048, target: 0.05 },
  { m: "Jul", tx: 46, complaints: 0.045, target: 0.05 },
  { m: "Aug", tx: 47, complaints: 0.043, target: 0.05 },
  { m: "Sep", tx: 48, complaints: 0.042, target: 0.05 },
  { m: "Oct", tx: 49, complaints: 0.040, target: 0.05 },
  { m: "Nov", tx: 50, complaints: 0.039, target: 0.05 },
  { m: "Dec", tx: 52, complaints: 0.037, target: 0.05 },
];
