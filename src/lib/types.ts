export type Symptom =
  | "nausea"
  | "vomiting"
  | "constipation"
  | "diarrhea"
  | "headache"
  | "fatigue"
  | "appetite_loss"
  | "injection_site_pain"
  | "other";

export type InjectionSite =
  | "abdomen_left"
  | "abdomen_right"
  | "thigh_left"
  | "thigh_right"
  | "arm_left"
  | "arm_right";

export type Medication = "wegovy" | "zepbound" | "other_glp1" | "unspecified";

export interface SideEffect {
  id: string;
  user_id: string;
  injection_log_id: string | null;
  recorded_at: string;
  days_after_injection: number | null;
  symptom: Symptom;
  severity: number;
  memo: string | null;
  created_at: string;
}

export interface InjectionSiteRecord {
  id: string;
  user_id: string;
  injection_log_id: string;
  site: InjectionSite;
  recorded_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  recorded_date: string;
  weight: number;
  body_fat: number | null;
  memo: string | null;
}

export interface DoseChange {
  id: string;
  user_id: string;
  changed_date: string;
  medication: Medication;
  dose: string;
}

export interface InjectionLog {
  id: string;
  user_id: string;
  scheduled_at: string;
  confirmed_at: string | null;
  status: "pending" | "confirmed" | "missed";
}

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  nausea: "嘔気",
  vomiting: "嘔吐",
  constipation: "便秘",
  diarrhea: "下痢",
  headache: "頭痛",
  fatigue: "倦怠感",
  appetite_loss: "食欲低下",
  injection_site_pain: "注射部位の痛み",
  other: "その他",
};

export const INJECTION_SITE_LABELS: Record<InjectionSite, string> = {
  abdomen_left: "お腹（左）",
  abdomen_right: "お腹（右）",
  thigh_left: "太もも（左）",
  thigh_right: "太もも（右）",
  arm_left: "上腕（左）",
  arm_right: "上腕（右）",
};

export const MEDICATION_LABELS: Record<Medication, string> = {
  wegovy: "ウゴービ",
  zepbound: "ゼップバウンド",
  other_glp1: "その他GLP-1",
  unspecified: "未設定",
};

export const MEDICATION_DOSES: Record<Medication, string[]> = {
  wegovy: ["0.25mg", "0.5mg", "1.0mg", "1.7mg", "2.4mg"],
  zepbound: ["2.5mg", "5mg", "7.5mg", "10mg", "12.5mg", "15mg"],
  other_glp1: [],
  unspecified: [],
};

export const MEDICATION_COLORS: Record<Medication, string> = {
  wegovy: "#3b82f6",   // blue
  zepbound: "#8b5cf6", // purple
  other_glp1: "#6b7280",
  unspecified: "#9ca3af",
};

export const SEVERITY_FACES = [
  "😊", "🙂", "😐", "😕", "😣",
  "😖", "😫", "😩", "🤢", "😵", "🆘",
];
