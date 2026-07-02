export type WatchStatus =
  | "draft" | "active" | "monitoring" | "alerting" | "challenged" | "appealed" | "resolved" | "archived";
export type SnapshotStatus =
  | "submitted" | "compared" | "routine" | "important" | "risky" | "suspicious" | "challenged" | "appealed" | "finalized";
export type Verdict = "" | "routine" | "important" | "risky" | "suspicious";
export type Severity = "" | "low" | "medium" | "high" | "critical";
export type AlertStatus = "proposed" | "published" | "dismissed" | "challenged" | "resolved";
export type ChallengeStatus = "open" | "upheld" | "dismissed";
export type AppealStatus = "open" | "accepted" | "denied";

export interface Watchlist {
  watchId: string;
  owner: string;
  title: string;
  sourceType: string;
  sourceUrls: string[];
  watchRules: string[];
  riskRubric: string[];
  alertThreshold: number;
  maxSnapshots: number;
  status: WatchStatus;
  createdAt: number;
  snapshotIds: string[];
  alertIds: string[];
  challengeIds: string[];
  appealIds: string[];
  auditTrailIds: string[];
}

export interface Snapshot {
  snapshotId: string;
  watchId: string;
  submitter: string;
  sourceUrl: string;
  snapshotSummary: string;
  evidenceUrls: string[];
  changeScore: number;
  riskScore: number;
  verdict: Verdict;
  severity: Severity;
  changeSummary: string;
  importantChanges: string[];
  riskFlags: string[];
  recommendedActions: string[];
  status: SnapshotStatus;
  createdAt: number;
  rawAssessmentJson: string;
}

export interface Alert {
  alertId: string;
  watchId: string;
  snapshotId: string;
  publisher: string;
  severity: Severity;
  summary: string;
  recommendedActions: string[];
  status: AlertStatus;
  createdAt: number;
}

export interface Challenge {
  challengeId: string;
  watchId: string;
  snapshotId: string;
  challenger: string;
  reason: string;
  evidenceUrls: string[];
  status: ChallengeStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Appeal {
  appealId: string;
  watchId: string;
  snapshotId: string;
  appellant: string;
  reason: string;
  evidenceUrls: string[];
  status: AppealStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Profile {
  address: string;
  watchesCreated: number;
  snapshotsSubmitted: number;
  snapshotsAccepted: number;
  alertsPublished: number;
  challengesWon: number;
  challengesLost: number;
  appealsWon: number;
  appealsLost: number;
  reputationScore: number;
  lastActivity: number;
}

export interface AuditRecord {
  auditId: string;
  action: string;
  actor: string;
  watchId: string;
  snapshotId: string;
  alertId: string;
  challengeId: string;
  appealId: string;
  summary: string;
  statusAfter: string;
  at: number;
}

export interface PublicStats {
  watchlists: number;
  snapshots: number;
  alerts: number;
  publishedAlerts: number;
  challenges: number;
  appeals: number;
  activeWatchlists: number;
  alertingWatchlists: number;
  openChallenges: number;
  openAppeals: number;
  auditRecords: number;
  clock: number;
}

/** Verdict → tone for chips + timeline. */
export type Tone = "routine" | "important" | "risky" | "neutral";
export function toneOf(verdict?: string): Tone {
  if (verdict === "routine") return "routine";
  if (verdict === "important") return "important";
  if (verdict === "risky" || verdict === "suspicious") return "risky";
  return "neutral";
}
export const TONE_HEX: Record<Tone, string> = {
  routine: "#4ADE80", important: "#22D3EE", risky: "#EF4444", neutral: "#7D938A",
};
