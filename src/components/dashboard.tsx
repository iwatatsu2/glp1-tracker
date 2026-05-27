"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  AlertCircle,
  Target,
  TrendingUp,
  BarChart3,
  Syringe,
  ChevronRight
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts"
import {
  getDaysAfterInjection,
  getNextInjectionDate,
  formatDate,
  SYMPTOMS
} from "@/lib/data"
import { useInjectionLogs, useWeightLogs, useSideEffects } from "@/hooks/useSupabaseData"
import type { TabId } from "./tab-bar"

interface DashboardProps {
  onNavigate: (tab: TabId) => void
  profileId: string
}

export function Dashboard({ onNavigate, profileId }: DashboardProps) {
  const { records: injections } = useInjectionLogs(profileId)
  const { records: weights } = useWeightLogs(profileId)
  const { records: sideEffectRecords } = useSideEffects(profileId)

  const lastInjection = injections[0]
  const daysAfterInjection = lastInjection ? getDaysAfterInjection(lastInjection.date) : 0
  const nextInjection = lastInjection ? getNextInjectionDate(lastInjection.date) : new Date()
  const progress = (daysAfterInjection / 7) * 100
  const isWarningPeriod = lastInjection && daysAfterInjection >= 2 && daysAfterInjection <= 3

  const recentSideEffects = sideEffectRecords
    .filter(r => r.date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
    .flatMap(r => r.symptoms)

  const chartData = weights.map(r => ({
    date: formatDate(r.date),
    weight: r.weight
  }))

  const noData = !lastInjection && weights.length === 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Syringe className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">GLP-1 Tracker</h1>
            <p className="text-sm text-muted-foreground">週1回注射管理アプリ</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('about' as TabId)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <Image src="/dr-iwatatsu.png" alt="" width={40} height={40} className="w-full object-cover object-top" style={{ height: '200%' }} />
          </div>
          <span className="text-xs text-muted-foreground">Dr. いわたつ</span>
        </button>
      </div>

      {/* Welcome message for new users */}
      {noData && (
        <Card className="bg-gradient-to-br from-blue-50/80 to-purple-50/40">
          <CardContent className="py-6 text-center">
            <Syringe className="size-8 text-primary mx-auto mb-3" />
            <p className="font-medium">ようこそ！</p>
            <p className="text-sm text-muted-foreground mt-1">
              下のボタンから記録を始めましょう
            </p>
          </CardContent>
        </Card>
      )}

      {/* Injection Status Card */}
      {lastInjection && (
        <Card className="overflow-hidden bg-gradient-to-br from-blue-50/80 to-purple-50/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">最終注射日</p>
                <p className="text-lg font-semibold">{formatDate(lastInjection.date)}</p>
                <p className="text-sm text-muted-foreground">次回予定: {formatDate(nextInjection)}</p>
                <Badge variant="secondary" className="mt-2 bg-secondary/10 text-secondary border-0">
                  {lastInjection.dosage}mg
                </Badge>
              </div>
              <div className="relative size-28">
                <svg className="progress-ring size-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${progress * 2.64} 264`} className="text-primary transition-all duration-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{daysAfterInjection}</span>
                  <span className="text-xs text-muted-foreground">日経過</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Banner */}
      {isWarningPeriod && (
        <Card className="border-warning/50 bg-warning/10 animate-pulse-warning">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-foreground">副作用が出やすい時期です</p>
                <p className="text-xs text-muted-foreground">注射後2-3日目は症状が出やすいです</p>
              </div>
              <Button size="sm" variant="outline" className="border-warning/50 text-warning-foreground hover:bg-warning/20" onClick={() => onNavigate('side-effects')}>
                記録
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard icon={AlertCircle} title="副作用記録" description="症状を記録" onClick={() => onNavigate('side-effects')} color="warning" />
        <QuickActionCard icon={TrendingUp} title="体重記録" description="体重を記録" onClick={() => onNavigate('weight')} color="success" />
        <QuickActionCard icon={Target} title="注射部位" description="部位を確認" onClick={() => onNavigate('sites')} color="primary" />
        <QuickActionCard icon={BarChart3} title="分析" description="データを見る" onClick={() => onNavigate('side-effects')} color="secondary" />
      </div>

      {/* Weight Chart Mini */}
      {chartData.length > 0 && (
        <Card className="bg-gradient-to-b from-slate-50/50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">体重推移</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onNavigate('weight')}>
                詳細 <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side Effects Summary */}
      <Card className="bg-gradient-to-b from-amber-50/30 to-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">今週の副作用</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onNavigate('side-effects')}>
              詳細 <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSideEffects.length > 0 ? (
            <div className="space-y-2">
              {[...new Set(recentSideEffects.map(s => s.symptom))].slice(0, 3).map(symptomId => {
                const symptom = SYMPTOMS.find(s => s.id === symptomId)
                const records = recentSideEffects.filter(s => s.symptom === symptomId)
                const avgSeverity = Math.round(records.reduce((a, b) => a + b.severity, 0) / records.length)
                if (!symptom) return null
                return (
                  <div key={symptomId} className="flex items-center gap-3 py-2">
                    <span className="text-xl">{symptom.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{symptom.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-success via-warning to-destructive rounded-full" style={{ width: `${avgSeverity * 10}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{avgSeverity}/10</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">今週の副作用記録はありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function QuickActionCard({ icon: Icon, title, description, onClick, color }: {
  icon: typeof AlertCircle; title: string; description: string; onClick: () => void; color: 'primary' | 'secondary' | 'warning' | 'success'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  }
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={onClick}>
      <CardContent className="p-4">
        <div className={`size-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
          <Icon className="size-5" />
        </div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
