// Role-based access control matrix for Sentinel EFRMP.

export type Role = "manager" | "analyst" | "compliance" | "cs" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  manager: "Fraud Manager",
  analyst: "Fraud Analyst",
  compliance: "Compliance Officer",
  cs: "CS Agent",
  admin: "IT/Security Admin",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  manager: "Akses penuh ke seluruh modul Sentinel EFRMP, termasuk Account Management.",
  analyst: "Investigasi alert, kasus, dan konfigurasi rule/scoring/blacklist.",
  compliance: "Pelaporan regulator BI/OJK, register fraud terkonfirmasi, dan audit trail.",
  cs: "Intake laporan dugaan fraud dari nasabah dan kanal whistleblowing.",
  admin: "Cyber security, audit trail (read-only), dan pengelolaan akun & role.",
};

// Map of role -> allowed pathnames. "*" means everything.
export const ROLE_ACCESS: Record<Role, string[] | "*"> = {
  manager: "*",
  analyst: [
    "/",
    "/transaction-monitoring",
    "/fraud-operations",
    "/suspicious",
    "/cases",
    "/users",
    "/rules",
    "/scoring",
    "/blacklist",
  ],
  compliance: ["/", "/fraud-register", "/regulatory", "/loss-ratio", "/audit"],
  cs: ["/cs-intake", "/whistleblowing"],
  admin: ["/cyber-security", "/audit", "/account-management"],
};

// Always-accessible paths for any signed-in user.
export const PUBLIC_AUTHED = ["/profile", "/access-denied"];

export function canAccess(role: Role, path: string): boolean {
  if (PUBLIC_AUTHED.includes(path)) return true;
  const acl = ROLE_ACCESS[role];
  if (acl === "*") return true;
  return acl.includes(path);
}

export function defaultLanding(role: Role): string {
  const acl = ROLE_ACCESS[role];
  if (acl === "*") return "/";
  return acl[0] ?? "/profile";
}

// Friendly menu titles for the Profile "Role & Access" matrix display.
export const MENU_TITLES: Record<string, string> = {
  "/": "Executive Dashboard",
  "/transaction-monitoring": "Real-Time Tx Monitoring",
  "/fraud-operations": "Fraud Operations",
  "/suspicious": "Suspicious Transactions",
  "/cases": "Case Management",
  "/fraud-register": "Confirmed Fraud Register",
  "/cs-intake": "Laporan Dugaan Fraud (CS Intake)",
  "/whistleblowing": "Whistleblowing System",
  "/users": "User Intelligence",
  "/cyber-security": "Cyber Security",
  "/loss-ratio": "Fraud Loss Ratio",
  "/regulatory": "Regulatory Reporting (BI/OJK)",
  "/audit": "Audit Trail",
  "/rules": "Rule Management",
  "/scoring": "Risk Scoring Engine",
  "/parameters": "Parameter Configurator",
  "/blacklist": "Blacklist Management",
  "/merchants": "Merchant Intelligence",
  "/ekyc": "e-KYC Fraud Monitor",
  "/analytics": "Fraud Analytics",
  "/operational-risk": "Operational Risk",
  "/consumer-protection": "Consumer Protection",
  "/risk-management": "Risk Management",
  "/complaint-ratio": "Complaint Ratio",
  "/administration": "Administration",
  "/account-management": "Account Management",
};

export function listAllowedMenus(role: Role): { path: string; title: string }[] {
  const acl = ROLE_ACCESS[role];
  const paths = acl === "*" ? Object.keys(MENU_TITLES) : acl;
  return paths.map((p) => ({ path: p, title: MENU_TITLES[p] ?? p }));
}
