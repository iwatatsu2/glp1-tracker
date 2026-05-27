"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Syringe,
  Moon,
  FileText,
  HelpCircle,
  ChevronRight,
  Shield,
  LogOut,
  Download,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { MEDICATIONS, MEDICATION_DOSES, SYMPTOMS, type Medication } from "@/lib/data"
import { useProfile, useInjectionLogs, useWeightLogs, useSideEffects } from "@/hooks/useSupabaseData"
import { getSupabase } from "@/lib/supabase"

type SettingsView = "main" | "guide" | "privacy" | "terms"

interface SettingsScreenProps {
  profileId: string
  onSignOut: () => void
}

export function SettingsScreen({ profileId, onSignOut }: SettingsScreenProps) {
  const { profile, updateProfile } = useProfile(profileId)
  const { records: injections } = useInjectionLogs(profileId)
  const { records: weightRecords } = useWeightLogs(profileId)
  const { records: sideEffectRecords } = useSideEffects(profileId)

  const lastInjection = injections[0]
  const currentDosage = lastInjection?.dosage || 0.25

  const [selectedMed, setSelectedMed] = useState<Medication>('wegovy')
  const [selectedDose, setSelectedDose] = useState<string>(currentDosage.toString())
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({ injection: true, sideEffect: true, weight: false })
  const [weightUnit, setWeightUnit] = useState("kg")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [view, setView] = useState<SettingsView>("main")

  useEffect(() => {
    if (profile?.medication) setSelectedMed(profile.medication)
    if (profile?.current_dose) setSelectedDose(profile.current_dose)
  }, [profile])

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("glp1-settings")
    if (saved) {
      const s = JSON.parse(saved)
      if (s.darkMode) { setDarkMode(true); document.documentElement.classList.add("dark") }
      if (s.notifications) setNotifications(s.notifications)
      if (s.weightUnit) setWeightUnit(s.weightUnit)
    }
  }, [])

  function saveLocal(updates: Record<string, unknown>) {
    const current = JSON.parse(localStorage.getItem("glp1-settings") || "{}")
    localStorage.setItem("glp1-settings", JSON.stringify({ ...current, ...updates }))
  }

  const doses = MEDICATION_DOSES[selectedMed]

  const handleMedChange = async (v: string | null) => {
    if (!v) return
    const med = v as Medication
    setSelectedMed(med)
    const newDoses = MEDICATION_DOSES[med]
    setSelectedDose(newDoses[0].toString())
    await updateProfile({ medication: med, current_dose: newDoses[0].toString() })
  }

  const handleDoseChange = async (v: string | null) => {
    if (!v) return
    setSelectedDose(v)
    await updateProfile({ current_dose: v })
  }

  const handleWeekdayChange = async (v: string | null) => {
    if (!v) return
    await updateProfile({ injection_weekday: parseInt(v) })
  }

  const handleDarkMode = (checked: boolean) => {
    setDarkMode(checked)
    document.documentElement.classList.toggle("dark", checked)
    saveLocal({ darkMode: checked })
  }

  const handleNotification = (key: keyof typeof notifications, checked: boolean) => {
    const updated = { ...notifications, [key]: checked }
    setNotifications(updated)
    saveLocal({ notifications: updated })
  }

  const handleWeightUnit = (v: string | null) => {
    if (!v) return
    setWeightUnit(v)
    saveLocal({ weightUnit: v })
  }

  const handleExport = async () => {
    setExporting(true)
    const lines = ["日付,体重(kg),用量(mg)"]
    for (const r of weightRecords) {
      lines.push(`${r.date.toISOString().split("T")[0]},${r.weight},${r.dosage}`)
    }
    lines.push("")
    lines.push("日付,注射部位,用量(mg)")
    for (const r of injections) {
      lines.push(`${r.date.toISOString().split("T")[0]},${r.site},${r.dosage}`)
    }
    lines.push("")
    lines.push("日付,症状,重症度,注射後日数")
    for (const r of sideEffectRecords) {
      for (const s of r.symptoms) {
        const symptomLabel = SYMPTOMS.find(sym => sym.id === s.symptom)?.label || s.symptom
        lines.push(`${r.date.toISOString().split("T")[0]},${symptomLabel},${s.severity},${r.daysAfterInjection}`)
      }
    }

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `glp1-tracker-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleDeleteData = async () => {
    setDeleting(true)
    const supabase = getSupabase()
    await supabase.from("tracker_weight_logs").delete().eq("user_id", profileId)
    await supabase.from("tracker_injection_logs").delete().eq("user_id", profileId)
    await supabase.from("tracker_side_effects").delete().eq("user_id", profileId)
    setDeleting(false)
    setShowDeleteConfirm(false)
    window.location.reload()
  }

  // Sub-pages
  if (view === "guide") {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="size-4" />戻る
        </button>
        <h1 className="text-xl font-bold">使い方ガイド</h1>
        <Card><CardContent className="pt-5 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">1. ホーム画面</h3>
            <p className="text-muted-foreground">次回の注射予定日、最新の体重、副作用サマリーを一目で確認できます。各カードをタップすると詳細画面に移動します。</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-1">2. 体重×用量</h3>
            <p className="text-muted-foreground">体重を記録し、用量変更ごとの体重推移をグラフで確認できます。毎日同じ時間に測定すると正確なトレンドが分かります。</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-1">3. 副作用記録</h3>
            <p className="text-muted-foreground">症状を選択し、重症度（0〜10）を記録します。注射後何日目かを自動計算し、パターンを分析できます。</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-1">4. 注射部位ローテーション</h3>
            <p className="text-muted-foreground">人体マップから注射部位を選択して記録。同じ部位への連続注射を防ぎ、おすすめの部位を提案します。</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-1">5. 設定</h3>
            <p className="text-muted-foreground">使用中の薬剤・用量・注射曜日を設定。ダークモード切替やデータのエクスポートも可能です。</p>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  if (view === "privacy") {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="size-4" />戻る
        </button>
        <h1 className="text-xl font-bold">プライバシーポリシー</h1>
        <Card><CardContent className="pt-5 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">最終更新日: 2025年5月27日</p>
          <p>GLP-1 Tracker（以下「本アプリ」）は、ユーザーの健康データを安全に管理するために以下の方針を定めています。</p>
          <h3 className="font-semibold text-foreground">1. 収集する情報</h3>
          <p>メールアドレス（認証用）、体重記録、注射記録、副作用記録。これらはサービス提供に必要な最小限の情報です。</p>
          <h3 className="font-semibold text-foreground">2. 情報の利用目的</h3>
          <p>ユーザー認証、データの保存・表示、サービスの改善にのみ使用します。第三者への提供・販売は行いません。</p>
          <h3 className="font-semibold text-foreground">3. データの保管</h3>
          <p>データはSupabase（クラウドデータベース）に暗号化して保管されます。行レベルセキュリティ（RLS）により、本人のデータのみアクセス可能です。</p>
          <h3 className="font-semibold text-foreground">4. データの削除</h3>
          <p>設定画面からいつでもすべてのデータを削除できます。アカウント削除をご希望の場合はお問い合わせください。</p>
          <h3 className="font-semibold text-foreground">5. お問い合わせ</h3>
          <p>開発者: 岩本 達也（糖尿病・内分泌代謝内科 専門医）</p>
        </CardContent></Card>
      </div>
    )
  }

  if (view === "terms") {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="size-4" />戻る
        </button>
        <h1 className="text-xl font-bold">利用規約</h1>
        <Card><CardContent className="pt-5 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">最終更新日: 2025年5月27日</p>
          <h3 className="font-semibold text-foreground">1. サービスの目的</h3>
          <p>本アプリは、GLP-1受容体作動薬の自己管理を支援する記録ツールです。医療行為の代替ではありません。</p>
          <h3 className="font-semibold text-foreground">2. 免責事項</h3>
          <p>本アプリの情報は参考情報であり、診断・治療の判断は必ず主治医にご相談ください。本アプリの使用によるいかなる損害についても責任を負いません。</p>
          <h3 className="font-semibold text-foreground">3. 禁止事項</h3>
          <p>不正アクセス、リバースエンジニアリング、他者のアカウントの使用を禁止します。</p>
          <h3 className="font-semibold text-foreground">4. 有料サービス</h3>
          <p>本アプリは有料です。購入後の返金は原則として行いません。</p>
          <h3 className="font-semibold text-foreground">5. 規約の変更</h3>
          <p>本規約は予告なく変更される場合があります。変更後も継続して利用された場合、変更に同意したものとみなします。</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">設定</h1>

      {/* Current Status */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Syringe className="size-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">現在の用量</p>
              <p className="text-2xl font-bold">{currentDosage}mg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Syringe className="size-4 text-primary" />
            薬剤設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>使用中の薬剤</Label>
            <Select value={selectedMed} onValueChange={handleMedChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDICATIONS.map(med => (
                  <SelectItem key={med.id} value={med.id}>{med.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>現在の用量</Label>
            <Select value={selectedDose} onValueChange={handleDoseChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doses.map(dose => (
                  <SelectItem key={dose} value={dose.toString()}>
                    {dose}mg
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>注射曜日</Label>
            <Select value={profile?.injection_weekday?.toString() || "0"} onValueChange={handleWeekdayChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">日曜日</SelectItem>
                <SelectItem value="1">月曜日</SelectItem>
                <SelectItem value="2">火曜日</SelectItem>
                <SelectItem value="3">水曜日</SelectItem>
                <SelectItem value="4">木曜日</SelectItem>
                <SelectItem value="5">金曜日</SelectItem>
                <SelectItem value="6">土曜日</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/20 dark:to-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">注射リマインダー</p>
              <p className="text-xs text-muted-foreground">注射予定日に通知</p>
            </div>
            <Switch checked={notifications.injection} onCheckedChange={(c) => handleNotification("injection", c)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">副作用記録リマインダー</p>
              <p className="text-xs text-muted-foreground">注射後2-3日目に通知</p>
            </div>
            <Switch checked={notifications.sideEffect} onCheckedChange={(c) => handleNotification("sideEffect", c)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">体重記録リマインダー</p>
              <p className="text-xs text-muted-foreground">毎日同じ時間に通知</p>
            </div>
            <Switch checked={notifications.weight} onCheckedChange={(c) => handleNotification("weight", c)} />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="size-4 text-primary" />
            表示設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ダークモード</p>
              <p className="text-xs text-muted-foreground">目に優しい表示</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleDarkMode} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>体重単位</Label>
            <Select value={weightUnit} onValueChange={handleWeightUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">キログラム（kg）</SelectItem>
                <SelectItem value="lb">ポンド（lb）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            データとプライバシー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-between h-auto py-3" onClick={handleExport} disabled={exporting}>
            <div className="flex items-center gap-3">
              <Download className="size-4 text-muted-foreground" />
              <span className="text-sm">{exporting ? "エクスポート中..." : "データをエクスポート"}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          {!showDeleteConfirm ? (
            <Button variant="ghost" className="w-full justify-between h-auto py-3 text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
              <div className="flex items-center gap-3">
                <Trash2 className="size-4" />
                <span className="text-sm">データを削除</span>
              </div>
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <div className="p-3 bg-destructive/10 rounded-lg space-y-2">
              <p className="text-sm text-destructive font-medium">すべてのデータが完全に削除されます。この操作は取り消せません。</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">キャンセル</Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteData} disabled={deleting} className="flex-1">
                  {deleting ? "削除中..." : "削除する"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            ヘルプとサポート
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-between h-auto py-3" onClick={() => setView("guide")}>
            <div className="flex items-center gap-3">
              <HelpCircle className="size-4 text-muted-foreground" />
              <span className="text-sm">使い方ガイド</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="w-full justify-between h-auto py-3" onClick={() => setView("privacy")}>
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm">プライバシーポリシー</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="w-full justify-between h-auto py-3" onClick={() => setView("terms")}>
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm">利用規約</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="outline" className="w-full" onClick={onSignOut}>
        <LogOut className="size-4 mr-2" />
        ログアウト
      </Button>

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">GLP-1 Tracker</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  )
}
