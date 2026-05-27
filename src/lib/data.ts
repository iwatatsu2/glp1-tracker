// Types
export interface InjectionRecord {
  id: string
  date: Date
  site: InjectionSite
  dosage: number
  notes?: string
}

export interface SideEffectRecord {
  id: string
  date: Date
  daysAfterInjection: number
  symptoms: SymptomRecord[]
  notes?: string
}

export interface SymptomRecord {
  symptom: Symptom
  severity: number
}

export interface WeightRecord {
  id: string
  date: Date
  weight: number
  dosage: number
}

export type InjectionSite =
  | 'left-arm'
  | 'right-arm'
  | 'left-abdomen'
  | 'right-abdomen'
  | 'left-thigh'
  | 'right-thigh'

export type Symptom =
  | 'nausea'
  | 'vomiting'
  | 'constipation'
  | 'diarrhea'
  | 'headache'
  | 'fatigue'
  | 'appetite-loss'
  | 'injection-pain'
  | 'other'

export const SYMPTOMS: { id: Symptom; label: string; emoji: string; tip: string }[] = [
  { id: 'nausea', label: '嘔気', emoji: '🤢', tip: '少量ずつゆっくり食事を摂ることで軽減できます' },
  { id: 'vomiting', label: '嘔吐', emoji: '🤮', tip: '水分補給を忘れずに。続く場合は医師に相談を' },
  { id: 'constipation', label: '便秘', emoji: '💩', tip: '食物繊維と水分を多めに摂りましょう' },
  { id: 'diarrhea', label: '下痢', emoji: '💨', tip: '脂っこい食事を避け、水分補給を心がけて' },
  { id: 'headache', label: '頭痛', emoji: '🤕', tip: '十分な水分摂取と休息が効果的です' },
  { id: 'fatigue', label: '倦怠感', emoji: '😴', tip: '無理せず休息を取りましょう' },
  { id: 'appetite-loss', label: '食欲低下', emoji: '🍽️', tip: '栄養バランスの良い少量の食事を心がけて' },
  { id: 'injection-pain', label: '注射部位痛', emoji: '💉', tip: '次回は別の部位に注射しましょう' },
  { id: 'other', label: 'その他', emoji: '❓', tip: '気になる症状があれば記録しておきましょう' },
]

export const INJECTION_SITES: { id: InjectionSite; label: string; position: { top: string; left: string } }[] = [
  { id: 'left-arm', label: '左上腕', position: { top: '22%', left: '18%' } },
  { id: 'right-arm', label: '右上腕', position: { top: '22%', left: '82%' } },
  { id: 'left-abdomen', label: '左お腹', position: { top: '42%', left: '35%' } },
  { id: 'right-abdomen', label: '右お腹', position: { top: '42%', left: '65%' } },
  { id: 'left-thigh', label: '左太もも', position: { top: '62%', left: '38%' } },
  { id: 'right-thigh', label: '右太もも', position: { top: '62%', left: '62%' } },
]

export type Medication = 'wegovy' | 'zepbound'

export const MEDICATIONS: { id: Medication; label: string; color: string }[] = [
  { id: 'wegovy', label: 'ウゴービ（Wegovy）', color: '#3b82f6' },
  { id: 'zepbound', label: 'ゼップバウンド（Zepbound）', color: '#8b5cf6' },
]

export const MEDICATION_DOSES: Record<Medication, number[]> = {
  wegovy: [0.25, 0.5, 1.0, 1.7, 2.4],
  zepbound: [2.5, 5, 7.5, 10, 12.5, 15],
}

export const DOSAGES = [0.25, 0.5, 1.0, 1.7, 2.4] // mg (default: wegovy)

// Mock data
const today = new Date()
const lastWeek = new Date(today)
lastWeek.setDate(lastWeek.getDate() - 5)

export const mockInjectionRecords: InjectionRecord[] = [
  { id: '1', date: lastWeek, site: 'left-abdomen', dosage: 1.0 },
  { id: '2', date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000), site: 'right-thigh', dosage: 1.0 },
  { id: '3', date: new Date(today.getTime() - 19 * 24 * 60 * 60 * 1000), site: 'right-abdomen', dosage: 0.5 },
  { id: '4', date: new Date(today.getTime() - 26 * 24 * 60 * 60 * 1000), site: 'left-thigh', dosage: 0.5 },
  { id: '5', date: new Date(today.getTime() - 33 * 24 * 60 * 60 * 1000), site: 'left-arm', dosage: 0.25 },
]

export const mockSideEffectRecords: SideEffectRecord[] = [
  {
    id: '1',
    date: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
    daysAfterInjection: 2,
    symptoms: [
      { symptom: 'nausea', severity: 6 },
      { symptom: 'fatigue', severity: 4 },
    ],
    notes: '食後に軽い吐き気',
  },
  {
    id: '2',
    date: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
    daysAfterInjection: 3,
    symptoms: [
      { symptom: 'nausea', severity: 3 },
      { symptom: 'appetite-loss', severity: 5 },
    ],
  },
  {
    id: '3',
    date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
    daysAfterInjection: 2,
    symptoms: [
      { symptom: 'nausea', severity: 7 },
      { symptom: 'headache', severity: 4 },
    ],
  },
]

export const mockWeightRecords: WeightRecord[] = [
  { id: '1', date: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000), weight: 85.0, dosage: 0.25 },
  { id: '2', date: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000), weight: 84.2, dosage: 0.25 },
  { id: '3', date: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000), weight: 83.5, dosage: 0.5 },
  { id: '4', date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), weight: 82.8, dosage: 0.5 },
  { id: '5', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), weight: 81.5, dosage: 1.0 },
  { id: '6', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), weight: 80.8, dosage: 1.0 },
]

// Helper functions
export function getDaysAfterInjection(lastInjectionDate: Date): number {
  const now = new Date()
  const diff = now.getTime() - lastInjectionDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getNextInjectionDate(lastInjectionDate: Date): Date {
  const next = new Date(lastInjectionDate)
  next.setDate(next.getDate() + 7)
  return next
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getSiteStatus(
  siteId: InjectionSite,
  records: InjectionRecord[]
): 'used' | 'recent' | 'recommended' | 'available' {
  const now = new Date()
  const sortedRecords = [...records].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (sortedRecords.length > 0 && sortedRecords[0].site === siteId) {
    return 'used'
  }

  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const recentlyUsed = records.some(
    r => r.site === siteId && r.date.getTime() > twoWeeksAgo.getTime()
  )
  if (recentlyUsed) {
    return 'recent'
  }

  const siteLastUsedDates = INJECTION_SITES.map(site => {
    const last = records.filter(r => r.site === site.id).sort((a, b) => b.date.getTime() - a.date.getTime())[0]
    return { site: site.id, date: last?.date ?? new Date(0) }
  })
  siteLastUsedDates.sort((a, b) => a.date.getTime() - b.date.getTime())

  if (siteLastUsedDates[0]?.site === siteId) {
    return 'recommended'
  }

  return 'available'
}

export function getSeverityEmoji(severity: number): string {
  if (severity === 0) return '😊'
  if (severity <= 2) return '🙂'
  if (severity <= 4) return '😐'
  if (severity <= 6) return '😕'
  if (severity <= 8) return '😣'
  return '😵'
}
