"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts"
import { SYMPTOMS, formatDate } from "@/lib/data"
import { useSideEffects, useInjectionLogs } from "@/hooks/useSupabaseData"

interface SideEffectsAnalysisProps {
  profileId: string
}

export function SideEffectsAnalysis({ profileId }: SideEffectsAnalysisProps) {
  const { records: sideEffectRecords } = useSideEffects(profileId)
  const { records: injections } = useInjectionLogs(profileId)

  const totalRecords = sideEffectRecords.length

  const daysCounts = Array(8).fill(0)
  sideEffectRecords.forEach(r => {
    if (r.daysAfterInjection >= 0 && r.daysAfterInjection <= 7) {
      daysCounts[r.daysAfterInjection]++
    }
  })
  const peakDay = daysCounts.indexOf(Math.max(...daysCounts))

  const allSymptoms = sideEffectRecords.flatMap(r => r.symptoms)
  const avgSeverity = allSymptoms.length > 0
    ? (allSymptoms.reduce((a, b) => a + b.severity, 0) / allSymptoms.length).toFixed(1)
    : 0

  const chartData = daysCounts.map((count, day) => ({
    day: `${day}日目`,
    count,
    isHighlight: day === 2 || day === 3
  }))

  const symptomCounts: Record<string, { count: number; totalSeverity: number }> = {}
  allSymptoms.forEach(s => {
    if (!symptomCounts[s.symptom]) {
      symptomCounts[s.symptom] = { count: 0, totalSeverity: 0 }
    }
    symptomCounts[s.symptom].count++
    symptomCounts[s.symptom].totalSeverity += s.severity
  })

  const symptomStats = SYMPTOMS.map(s => ({
    ...s,
    count: symptomCounts[s.id]?.count || 0,
    avgSeverity: symptomCounts[s.id]
      ? Math.round(symptomCounts[s.id].totalSeverity / symptomCounts[s.id].count * 10) / 10
      : 0
  })).sort((a, b) => b.count - a.count)

  const maxCount = Math.max(...symptomStats.map(s => s.count), 1)

  const dosageChanges = injections
    .filter((r, i, arr) => i === 0 || r.dosage !== arr[i - 1]?.dosage)
    .map(r => ({
      date: formatDate(r.date),
      dosage: r.dosage,
      sideEffectsCount: sideEffectRecords.filter(sr => {
        const diff = sr.date.getTime() - r.date.getTime()
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
      }).length
    }))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">副作用分析</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-primary">{totalRecords}</p><p className="text-xs text-muted-foreground">記録数</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-warning">{totalRecords > 0 ? `${peakDay}日目` : '-'}</p><p className="text-xs text-muted-foreground">ピーク日</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-secondary">{avgSeverity}</p><p className="text-xs text-muted-foreground">平均重症度</p></CardContent></Card>
      </div>

      {totalRecords > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">注射後日数別の副作用発生</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [`${value}件`, '記録数']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.isHighlight ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-warning mr-1" />
              2-3日目は副作用が出やすい時期です
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">症状別頻度</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {symptomStats.filter(s => s.count > 0).map((symptom) => (
              <div key={symptom.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{symptom.emoji}</span>
                    <span className="text-sm font-medium">{symptom.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{symptom.count}回</span>
                    <Badge variant="secondary" className="text-xs">平均 {symptom.avgSeverity}</Badge>
                  </div>
                </div>
                <Progress value={(symptom.count / maxCount) * 100} className="h-2" />
              </div>
            ))}
            {symptomStats.filter(s => s.count > 0).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">副作用の記録がありません</p>
            )}
          </div>
        </CardContent>
      </Card>

      {dosageChanges.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">用量変更と副作用の関係</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dosageChanges.map((change, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-medium text-xs">{change.dosage}mg</div>
                    {index < dosageChanges.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{change.date}</span>
                      {change.sideEffectsCount > 0 && <Badge variant="outline" className="text-xs">副作用 {change.sideEffectsCount}件</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
