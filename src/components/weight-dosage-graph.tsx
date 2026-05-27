"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { TrendingDown, TrendingUp, Scale, Activity } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  formatDate,
  MEDICATIONS,
  type Medication,
} from "@/lib/data"
import { useWeightLogs, useProfile } from "@/hooks/useSupabaseData"

interface WeightDosageGraphProps {
  profileId: string
}

export function WeightDosageGraph({ profileId }: WeightDosageGraphProps) {
  const [newWeight, setNewWeight] = useState("")
  const [medication, setMedication] = useState<Medication>('wegovy')
  const [animationKey, setAnimationKey] = useState(0)
  const [saving, setSaving] = useState(false)

  const { records: weightRecords, addWeight } = useWeightLogs(profileId)
  const { profile } = useProfile(profileId)

  useEffect(() => { setAnimationKey(prev => prev + 1) }, [])
  useEffect(() => { if (profile?.medication) setMedication(profile.medication) }, [profile])

  const currentWeight = weightRecords[weightRecords.length - 1]?.weight || 0
  const startWeight = weightRecords[0]?.weight || 0
  const weightChange = currentWeight - startWeight
  const isWeightLoss = weightChange < 0
  const heightM = profile?.height ? profile.height / 100 : 1.70
  const bmi = currentWeight > 0 ? (currentWeight / (heightM * heightM)).toFixed(1) : '-'

  const chartData = weightRecords.map(r => ({ date: formatDate(r.date), weight: r.weight, dosage: r.dosage }))
  const dosageChanges = weightRecords
    .filter((r, i, arr) => i === 0 || r.dosage !== arr[i - 1]?.dosage)
    .map(r => ({ date: formatDate(r.date), dosage: r.dosage }))

  const handleSaveWeight = async () => {
    if (!newWeight) return
    setSaving(true)
    const currentDosage = weightRecords[weightRecords.length - 1]?.dosage || 0.25
    await addWeight(parseFloat(newWeight), currentDosage)
    setNewWeight("")
    setSaving(false)
    setAnimationKey(prev => prev + 1)
  }

  const dosageColors: Record<number, string> = {
    0.25: 'rgba(59, 130, 246, 0.15)', 0.5: 'rgba(139, 92, 246, 0.15)',
    1.0: 'rgba(34, 197, 94, 0.15)', 1.7: 'rgba(245, 158, 11, 0.15)',
    2.4: 'rgba(239, 68, 68, 0.15)', 2.5: 'rgba(139, 92, 246, 0.12)',
    5: 'rgba(139, 92, 246, 0.18)', 7.5: 'rgba(34, 197, 94, 0.15)',
    10: 'rgba(245, 158, 11, 0.15)', 12.5: 'rgba(239, 68, 68, 0.12)',
    15: 'rgba(239, 68, 68, 0.18)',
  }

  const uniqueDosages = [...new Set(weightRecords.map(r => r.dosage))].sort()
  const medInfo = MEDICATIONS.find(m => m.id === medication)!

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">体重×用量</h1>

      <div className="flex gap-2">
        {MEDICATIONS.map(med => (
          <button key={med.id} onClick={() => setMedication(med.id)}
            className={cn("flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2",
              medication === med.id ? "text-white shadow-md" : "bg-white text-muted-foreground border-border hover:border-primary/30"
            )}
            style={medication === med.id ? { backgroundColor: med.color, borderColor: med.color } : {}}
          >{med.label.split('（')[0]}</button>
        ))}
      </div>

      {currentWeight > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-b from-blue-50 to-white">
            <CardContent className="pt-4 pb-3 text-center">
              <Scale className="size-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{currentWeight}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </CardContent>
          </Card>
          <Card className={cn("bg-gradient-to-b", isWeightLoss ? "from-green-50 to-white" : "from-red-50 to-white")}>
            <CardContent className="pt-4 pb-3 text-center">
              {isWeightLoss ? <TrendingDown className="size-5 text-success mx-auto mb-1" /> : <TrendingUp className="size-5 text-destructive mx-auto mb-1" />}
              <p className={cn("text-2xl font-bold", isWeightLoss ? "text-success" : "text-destructive")}>{weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg変化</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-purple-50 to-white">
            <CardContent className="pt-4 pb-3 text-center">
              <Activity className="size-5 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold">{bmi}</p>
              <p className="text-xs text-muted-foreground">BMI</p>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 1 && (
        <Card className="bg-gradient-to-b from-slate-50/50 to-white">
          <CardHeader className="pb-2"><CardTitle className="text-base">体重推移と用量</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  {chartData.map((entry, index) => {
                    if (index === 0) return null
                    const prevEntry = chartData[index - 1]
                    if (prevEntry.dosage !== entry.dosage || index === chartData.length - 1) {
                      let startIndex = index - 1
                      while (startIndex > 0 && chartData[startIndex - 1].dosage === prevEntry.dosage) startIndex--
                      return <ReferenceArea key={`area-${index}`} x1={chartData[startIndex].date} x2={entry.date} fill={dosageColors[prevEntry.dosage] || 'rgba(0,0,0,0.05)'} />
                    }
                    return null
                  })}
                  {dosageChanges.slice(1).map((change, index) => (
                    <ReferenceLine key={index} x={change.date} stroke={medInfo.color} strokeDasharray="4 4" label={{ value: `${change.dosage}mg`, position: 'top', fontSize: 10, fill: medInfo.color, offset: 5 }} />
                  ))}
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 2)]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} tickFormatter={(value) => `${value}kg`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(value, name) => [name === 'weight' ? `${value}kg` : `${value}mg`, name === 'weight' ? '体重' : '用量']} />
                  <Line key={animationKey} type="monotone" dataKey="weight" stroke={medInfo.color} strokeWidth={2.5} dot={{ fill: medInfo.color, strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: medInfo.color }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {uniqueDosages.map(dosage => (
                <div key={dosage} className="flex items-center gap-1">
                  <div className="size-3 rounded" style={{ backgroundColor: dosageColors[dosage]?.replace('0.1', '0.4').replace('0.15', '0.4').replace('0.12', '0.4').replace('0.18', '0.5') }} />
                  <span className="text-xs text-muted-foreground">{dosage}mg</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <div className="w-4 border-t-2 border-dashed" style={{ borderColor: medInfo.color }} />
                <span className="text-xs text-muted-foreground">用量変更</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-b from-blue-50/30 to-white">
        <CardHeader className="pb-2"><CardTitle className="text-base">体重を記録</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="weight" className="sr-only">体重</Label>
              <Input id="weight" type="number" step="0.1" placeholder="体重を入力 (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="text-lg h-12" />
            </div>
            <Button size="lg" className="h-12 px-6" onClick={handleSaveWeight} disabled={!newWeight || saving}>{saving ? "..." : "記録"}</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">毎日同じ時間に測定すると正確なトレンドが分かります</p>
        </CardContent>
      </Card>

      {weightRecords.length > 0 && (
        <>
          <Separator />
          <Card className="bg-slate-50/50">
            <CardHeader className="pb-2"><CardTitle className="text-base">記録履歴</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...weightRecords].reverse().map((record, index, arr) => {
                  const prevRecord = arr[index + 1]
                  const diff = prevRecord ? record.weight - prevRecord.weight : 0
                  return (
                    <div key={record.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{record.weight} kg</p>
                          <p className="text-xs text-muted-foreground">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {diff !== 0 && <span className={cn("text-xs font-medium", diff < 0 ? "text-success" : "text-destructive")}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>}
                        <Badge variant="outline" className="text-xs">{record.dosage}mg</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
