// Demo data for development without Supabase connection
import { SideEffect, InjectionSiteRecord, WeightLog, DoseChange, InjectionLog } from "./types";

const DEMO_USER_ID = "demo-user";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const demoInjectionLogs: InjectionLog[] = [
  { id: "inj-1", user_id: DEMO_USER_ID, scheduled_at: daysAgo(0), confirmed_at: daysAgo(0), status: "confirmed" },
  { id: "inj-2", user_id: DEMO_USER_ID, scheduled_at: daysAgo(7), confirmed_at: daysAgo(7), status: "confirmed" },
  { id: "inj-3", user_id: DEMO_USER_ID, scheduled_at: daysAgo(14), confirmed_at: daysAgo(14), status: "confirmed" },
  { id: "inj-4", user_id: DEMO_USER_ID, scheduled_at: daysAgo(21), confirmed_at: daysAgo(21), status: "confirmed" },
  { id: "inj-5", user_id: DEMO_USER_ID, scheduled_at: daysAgo(28), confirmed_at: null, status: "missed" },
];

export const demoSideEffects: SideEffect[] = [
  { id: "se-1", user_id: DEMO_USER_ID, injection_log_id: "inj-2", recorded_at: daysAgo(5), days_after_injection: 2, symptom: "nausea", severity: 6, memo: "夕食後に強くなった", created_at: daysAgo(5) },
  { id: "se-2", user_id: DEMO_USER_ID, injection_log_id: "inj-2", recorded_at: daysAgo(4), days_after_injection: 3, symptom: "nausea", severity: 3, memo: null, created_at: daysAgo(4) },
  { id: "se-3", user_id: DEMO_USER_ID, injection_log_id: "inj-2", recorded_at: daysAgo(5), days_after_injection: 2, symptom: "constipation", severity: 4, memo: null, created_at: daysAgo(5) },
  { id: "se-4", user_id: DEMO_USER_ID, injection_log_id: "inj-3", recorded_at: daysAgo(12), days_after_injection: 2, symptom: "nausea", severity: 7, memo: "かなり辛かった", created_at: daysAgo(12) },
  { id: "se-5", user_id: DEMO_USER_ID, injection_log_id: "inj-3", recorded_at: daysAgo(11), days_after_injection: 3, symptom: "vomiting", severity: 5, memo: null, created_at: daysAgo(11) },
  { id: "se-6", user_id: DEMO_USER_ID, injection_log_id: "inj-3", recorded_at: daysAgo(13), days_after_injection: 1, symptom: "fatigue", severity: 3, memo: null, created_at: daysAgo(13) },
  { id: "se-7", user_id: DEMO_USER_ID, injection_log_id: "inj-4", recorded_at: daysAgo(19), days_after_injection: 2, symptom: "nausea", severity: 4, memo: null, created_at: daysAgo(19) },
  { id: "se-8", user_id: DEMO_USER_ID, injection_log_id: "inj-4", recorded_at: daysAgo(18), days_after_injection: 3, symptom: "constipation", severity: 5, memo: "水分を多めに取った", created_at: daysAgo(18) },
];

export const demoInjectionSites: InjectionSiteRecord[] = [
  { id: "site-1", user_id: DEMO_USER_ID, injection_log_id: "inj-1", site: "abdomen_left", recorded_at: daysAgo(0) },
  { id: "site-2", user_id: DEMO_USER_ID, injection_log_id: "inj-2", site: "abdomen_right", recorded_at: daysAgo(7) },
  { id: "site-3", user_id: DEMO_USER_ID, injection_log_id: "inj-3", site: "thigh_left", recorded_at: daysAgo(14) },
  { id: "site-4", user_id: DEMO_USER_ID, injection_log_id: "inj-4", site: "thigh_right", recorded_at: daysAgo(21) },
];

export const demoWeightLogs: WeightLog[] = Array.from({ length: 12 }, (_, i) => ({
  id: `w-${i}`,
  user_id: DEMO_USER_ID,
  recorded_date: dateStr(i * 7),
  weight: 85 - i * 0.6 + Math.random() * 0.4,
  body_fat: 28 - i * 0.3 + Math.random() * 0.2,
  memo: null,
})).reverse();

export const demoDoseChanges: DoseChange[] = [
  { id: "dose-1", user_id: DEMO_USER_ID, changed_date: dateStr(84), medication: "wegovy", dose: "0.25mg" },
  { id: "dose-2", user_id: DEMO_USER_ID, changed_date: dateStr(56), medication: "wegovy", dose: "0.5mg" },
  { id: "dose-3", user_id: DEMO_USER_ID, changed_date: dateStr(28), medication: "wegovy", dose: "1.0mg" },
];
