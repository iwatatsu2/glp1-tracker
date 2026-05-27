"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SYMPTOMS,
  mockInjectionRecords,
  mockSideEffectRecords,
  getDaysAfterInjection,
  formatDate,
  getSeverityEmoji,
  type Symptom,
} from "@/lib/data"

export function SideEffectsRecord() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<Symptom>>(new Set())
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState("")
  const [showTip, setShowTip] = useState<Symptom | null>(null)

  const lastInjection = mockInjectionRecords[0]
  const daysAfterInjection = getDaysAfterInjection(lastInjection.date)
  const isWarningPeriod = daysAfterInjection >= 2 && daysAfterInjection <= 3

  const toggleSymptom = (symptom: Symptom) => {
    const newSelected = new Set(selectedSymptoms)
    if (newSelected.has(symptom)) {
      newSelected.delete(symptom)
    } else {
      newSelected.add(symptom)
    }
    setSelectedSymptoms(newSelected)
  }

  const handleSave = () => {
    console.log({
      symptoms: Array.from(selectedSymptoms).map(s => ({ symptom: s, severity })),
      notes,
      daysAfterInjection
    })
    setSelectedSymptoms(new Set())
    setSeverity(5)
    setNotes("")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">副作用記録</h1>
        <Badge
          className={cn(
            "text-sm",
            isWarningPeriod
              ? "bg-warning/20 text-warning-foreground border-warning/50 animate-pulse-warning"
              : "bg-primary/10 text-primary border-0"
          )}
        >
          注射後{daysAfterInjection}日目
        </Badge>
      </div>

      {/* Symptom Grid */}
      <Card className="bg-gradient-to-b from-orange-50/30 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">症状を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.has(symptom.id)
              return (
                <div key={symptom.id} className="relative">
                  <button
                    onClick={() => toggleSymptom(symptom.id)}
                    className={cn(
                      "w-full py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/10 scale-105 shadow-lg"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 size-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-2xl">{symptom.emoji}</span>
                    <span className="text-xs font-medium text-center px-1">{symptom.label}</span>
                  </button>
                  <button
                    onClick={() => setShowTip(showTip === symptom.id ? null : symptom.id)}
                    className="absolute -bottom-1 -right-1 size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent"
                  >
                    <Info className="size-3" />
                  </button>

                  {showTip === symptom.id && (
                    <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-card border rounded-lg shadow-lg text-xs text-muted-foreground">
                      {symptom.tip}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Severity Slider */}
      {selectedSymptoms.size > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">重症度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{getSeverityEmoji(severity)}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">軽い</span>
                  <span className="text-2xl font-bold">{severity}</span>
                  <span className="text-sm text-muted-foreground">重い</span>
                </div>
                <Slider
                  value={[severity]}
                  onValueChange={(v) => setSeverity(Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">メモ（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="症状の詳細、食事内容、気づいたことなど..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        className="w-full"
        size="lg"
        disabled={selectedSymptoms.size === 0}
        onClick={handleSave}
      >
        記録を保存
      </Button>

      <Separator />

      {/* Recent Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">最近の記録</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSideEffectRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-3 rounded-full bg-primary" />
                  <div className="flex-1 w-px bg-border mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{formatDate(record.date)}</span>
                    <Badge variant="outline" className="text-xs">
                      注射後{record.daysAfterInjection}日目
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {record.symptoms.map((s, i) => {
                      const symptom = SYMPTOMS.find(sym => sym.id === s.symptom)
                      return (
                        <span key={i} className="text-sm">
                          {symptom?.emoji} {symptom?.label}
                          <span className="text-muted-foreground ml-1">({s.severity})</span>
                        </span>
                      )
                    })}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
