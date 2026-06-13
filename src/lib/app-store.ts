// Client-side shared store with localStorage persistence.
// Used to make Approve/Reject/Blacklist, CS notes/escalation,
// blacklist add/remove, audit-trail appends, and auth/RBAC
// (login/logout, user directory, account management) persist.

import { useSyncExternalStore } from "react";
import type { Role } from "./rbac";


export type AlertOverride = "Approved" | "Rejected" | "Blacklisted";

export interface AuditEntry {
  ts: string;
  user: string;
  action: string;
  object: string;
  sensitive: boolean;
  before: string | null;
  after: string | null;
  summary: string | null;
}

export interface BlacklistEntry {
  id: string;
  reason: string;
  addedBy: string;
  date: string;
}

export type BlacklistCategory = "user" | "device" | "merchant" | "account" | "ip";

export interface CsTimelineEntry {
  ts: string;
  actor: string;
  note: string;
}

export interface CsReport {
  id: string;
  tanggal: string;
  pelapor: string;
  txId?: string;
  deskripsi: string;
  status: "Open" | "In Review" | "Resolved";
  catatan: string;
  timeline: CsTimelineEntry[];
  caseId?: string;
}

export interface ExtraCase {
  id: string;
  user: string;
  type: string;
  amount: number;
  lossAmount: number;
  recoveredAmount: number;
  location: string;
  perpetratorAccount: string;
  division: string;
  recommendation: string;
  status: string;
  assignee: string;
  age: number;
  sla: string;
  sourceReportId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  department: string;
  employeeId: string;
  phone: string;
  office: string;
  status: "Aktif" | "Nonaktif";
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  loginAt: string;
}

interface AppState {
  alertOverrides: Record<string, AlertOverride>;
  extraAudit: AuditEntry[];
  extraBlacklists: Record<BlacklistCategory, BlacklistEntry[]>;
  removedBlacklists: Record<BlacklistCategory, string[]>;
  csReports: CsReport[] | null; // null = use seed
  extraCases: ExtraCase[];
  users: AppUser[];
  session: AuthSession | null;
}

const STORAGE_KEY = "sentinel-efrmp-store-v1";
export const CURRENT_USER = "Andini Putri";
export const CURRENT_USER_HANDLE = "andini.p";

const seedUsers: AppUser[] = [
  {
    id: "U-001",
    name: "Andini Putri",
    email: "andini.putri@sentinel.id",
    username: "andini.p",
    role: "manager",
    department: "Fraud Risk Management",
    employeeId: "EMP-10231",
    phone: "+62 812-1100-0001",
    office: "HQ Jakarta",
    status: "Aktif",
    lastLogin: null,
    createdAt: "2024-02-14",
  },
  {
    id: "U-002",
    name: "Bagas Wirawan",
    email: "bagas.w@sentinel.id",
    username: "bagas.w",
    role: "analyst",
    department: "Fraud Operations",
    employeeId: "EMP-10455",
    phone: "+62 812-1100-0002",
    office: "HQ Jakarta",
    status: "Aktif",
    lastLogin: null,
    createdAt: "2024-05-02",
  },
  {
    id: "U-003",
    name: "Citra Larasati",
    email: "citra.l@sentinel.id",
    username: "citra.l",
    role: "compliance",
    department: "Compliance & Regulatory",
    employeeId: "EMP-10612",
    phone: "+62 812-1100-0003",
    office: "HQ Jakarta",
    status: "Aktif",
    lastLogin: null,
    createdAt: "2024-06-19",
  },
  {
    id: "U-004",
    name: "Dimas Hidayat",
    email: "dimas.h@sentinel.id",
    username: "dimas.h",
    role: "cs",
    department: "Customer Service",
    employeeId: "EMP-10788",
    phone: "+62 812-1100-0004",
    office: "Cabang Bandung",
    status: "Aktif",
    lastLogin: null,
    createdAt: "2024-08-04",
  },
  {
    id: "U-005",
    name: "Erlina Suryani",
    email: "erlina.s@sentinel.id",
    username: "erlina.s",
    role: "admin",
    department: "IT Security",
    employeeId: "EMP-10901",
    phone: "+62 812-1100-0005",
    office: "HQ Jakarta",
    status: "Aktif",
    lastLogin: null,
    createdAt: "2024-09-21",
  },
];

const defaultState: AppState = {
  alertOverrides: {},
  extraAudit: [],
  extraBlacklists: { user: [], device: [], merchant: [], account: [], ip: [] },
  removedBlacklists: { user: [], device: [], merchant: [], account: [], ip: [] },
  csReports: null,
  extraCases: [],
  users: seedUsers,
  session: null,
};


let state: AppState = defaultState;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function load() {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...defaultState, ...parsed, extraBlacklists: { ...defaultState.extraBlacklists, ...(parsed.extraBlacklists ?? {}) }, removedBlacklists: { ...defaultState.removedBlacklists, ...(parsed.removedBlacklists ?? {}) } };
    }
  } catch {
    state = defaultState;
  }
}
load();

function persist() {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return defaultState;
}

export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(defaultState));
}

// ---------- helpers ----------
function nowTs(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDate(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- actions ----------
export function addAudit(entry: Omit<AuditEntry, "ts"> & { ts?: string }) {
  const e: AuditEntry = { ts: entry.ts ?? nowTs(), ...entry };
  setState((s) => ({ ...s, extraAudit: [e, ...s.extraAudit] }));
}

export function applyAlertAction(opts: {
  alertId: string;
  txId: string;
  userId: string;
  action: AlertOverride;
  previousStatus: string;
}) {
  setState((s) => ({
    ...s,
    alertOverrides: { ...s.alertOverrides, [opts.alertId]: opts.action },
  }));
  const actionName =
    opts.action === "Approved"
      ? "Transaction Approved"
      : opts.action === "Rejected"
        ? "Transaction Rejected"
        : "User Blacklisted";
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: actionName,
    object: opts.txId,
    sensitive: true,
    before: opts.previousStatus,
    after: opts.action,
    summary: null,
  });
  if (opts.action === "Blacklisted") {
    addBlacklist("user", {
      id: opts.userId,
      reason: `Blacklisted from manual review · ${opts.alertId}`,
      addedBy: CURRENT_USER_HANDLE,
      date: nowDate(),
    });
  }
}

export function addBlacklist(category: BlacklistCategory, entry: Omit<BlacklistEntry, "addedBy" | "date"> & { addedBy?: string; date?: string; reason: string }) {
  const e: BlacklistEntry = {
    id: entry.id,
    reason: entry.reason,
    addedBy: entry.addedBy ?? CURRENT_USER_HANDLE,
    date: entry.date ?? nowDate(),
  };
  setState((s) => {
    // un-remove if previously removed
    const removed = s.removedBlacklists[category].filter((id) => id !== e.id);
    return {
      ...s,
      extraBlacklists: { ...s.extraBlacklists, [category]: [e, ...s.extraBlacklists[category]] },
      removedBlacklists: { ...s.removedBlacklists, [category]: removed },
    };
  });
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: "Blacklist Added",
    object: e.id,
    sensitive: true,
    before: "—",
    after: `Blacklisted (${category})`,
    summary: null,
  });
}

export function removeBlacklist(category: BlacklistCategory, id: string) {
  setState((s) => ({
    ...s,
    removedBlacklists: {
      ...s.removedBlacklists,
      [category]: s.removedBlacklists[category].includes(id)
        ? s.removedBlacklists[category]
        : [...s.removedBlacklists[category], id],
    },
    extraBlacklists: {
      ...s.extraBlacklists,
      [category]: s.extraBlacklists[category].filter((e) => e.id !== id),
    },
  }));
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: "Blacklist Removed",
    object: id,
    sensitive: true,
    before: `Blacklisted (${category})`,
    after: "Removed",
    summary: null,
  });
}

// ---------- CS Intake ----------
export function initCsReports(seed: CsReport[]) {
  if (state.csReports === null) {
    setState((s) => ({ ...s, csReports: seed }));
  }
}

export function csAddNote(id: string, note: string) {
  if (!note.trim()) return;
  setState((s) => ({
    ...s,
    csReports: (s.csReports ?? []).map((r) =>
      r.id === id
        ? { ...r, timeline: [...r.timeline, { ts: nowTs(), actor: CURRENT_USER, note }] }
        : r,
    ),
  }));
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: "CS Note Added",
    object: id,
    sensitive: false,
    before: null,
    after: null,
    summary: `note ditambahkan pada ${id}`,
  });
}

export function csSetStatus(id: string, status: CsReport["status"]) {
  let prev: CsReport["status"] = "Open";
  setState((s) => ({
    ...s,
    csReports: (s.csReports ?? []).map((r) => {
      if (r.id !== id) return r;
      prev = r.status;
      return {
        ...r,
        status,
        timeline: [
          ...r.timeline,
          { ts: nowTs(), actor: CURRENT_USER, note: `Status diubah: ${prev} → ${status}` },
        ],
      };
    }),
  }));
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: "CS Status Changed",
    object: id,
    sensitive: true,
    before: prev,
    after: status,
    summary: null,
  });
}

export function csEscalate(id: string): string {
  const caseId = `CASE-${21000 + Math.floor(Math.random() * 8999)}`;
  let report: CsReport | undefined;
  setState((s) => ({
    ...s,
    csReports: (s.csReports ?? []).map((r) => {
      if (r.id !== id) return r;
      report = r;
      return {
        ...r,
        caseId,
        status: "In Review",
        timeline: [
          ...r.timeline,
          { ts: nowTs(), actor: CURRENT_USER, note: `Eskalasi ke Case Management → ${caseId}` },
        ],
      };
    }),
  }));
  setState((s) => ({
    ...s,
    extraCases: [
      {
        id: caseId,
        user: report?.pelapor ?? "—",
        type: "CS Escalation",
        amount: 0,
        lossAmount: 0,
        recoveredAmount: 0,
        location: "—",
        perpetratorAccount: "—",
        division: "Fraud Ops",
        recommendation: `Investigasi laporan CS ${id}: ${report?.deskripsi ?? ""}`,
        status: "Open",
        assignee: CURRENT_USER,
        age: 0,
        sla: "On Track",
        sourceReportId: id,
      },
      ...s.extraCases,
    ],
  }));
  addAudit({
    user: CURRENT_USER_HANDLE,
    action: "Case Escalated",
    object: caseId,
    sensitive: true,
    before: id,
    after: caseId,
    summary: null,
  });
  return caseId;
}
