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
} from "lucide-react"
import { MEDICATIONS, MEDICATION_DOSES, type Medication } from "@/lib/data"
import { useProfile, useInjectionLogs } from "@/hooks/useSupabaseData"

interface SettingsScreenProps {
  profileId: string
  onSignOut: () => void
}

export function SettingsScreen({ profileId, onSignOut }: SettingsScreenProps) {
  const { profile, updateProfile } = useProfile(profileId)
  const { records: injections } = useInjectionLogs(profileId)

  const lastInjection = injections[0]
  const currentDosage = lastInjection?.dosage || 0.25

  const [selectedMed, setSelectedMed] = useState<Medication>('wegovy')
  const [selectedDose, setSelectedDose] = useState<string>(currentDosage.toString())

  useEffect(() => {
    if (profile?.medication) setSelectedMed(profile.medication)
    if (profile?.current_dose) setSelectedDose(profile.current_dose)
  }, [profile])

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
      <Card className="bg-gradient-to-b from-blue-50/30 to-white">
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
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">副作用記録リマインダー</p>
              <p className="text-xs text-muted-foreground">注射後2-3日目に通知</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">体重記録リマインダー</p>
              <p className="text-xs text-muted-foreground">毎日同じ時間に通知</p>
            </div>
            <Switch />
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
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>体重単位</Label>
            <Select defaultValue="kg">
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
          <Button variant="ghost" className="w-full justify-between h-auto py-3">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm">データをエクスポート</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="w-full justify-between h-auto py-3 text-destructive hover:text-destructive">
            <div className="flex items-center gap-3">
              <FileText className="size-4" />
              <span className="text-sm">データを削除</span>
            </div>
            <ChevronRight className="size-4" />
          </Button>
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
          <Button variant="ghost" className="w-full justify-between h-auto py-3">
            <div className="flex items-center gap-3">
              <HelpCircle className="size-4 text-muted-foreground" />
              <span className="text-sm">使い方ガイド</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="w-full justify-between h-auto py-3">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm">プライバシーポリシー</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="w-full justify-between h-auto py-3">
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
