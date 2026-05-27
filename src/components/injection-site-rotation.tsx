"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  INJECTION_SITES,
  getSiteStatus,
  formatDate,
  type InjectionSite
} from "@/lib/data"
import { useInjectionLogs } from "@/hooks/useSupabaseData"

const SITE_POSITIONS: Record<InjectionSite, { x: number; y: number }> = {
  'left-arm': { x: 32.5, y: 32.7 },
  'right-arm': { x: 67.5, y: 32.7 },
  'left-abdomen': { x: 43.2, y: 42.7 },
  'right-abdomen': { x: 56.8, y: 42.6 },
  'left-thigh': { x: 42.0, y: 62.4 },
  'right-thigh': { x: 57.9, y: 62.4 },
}

function getSiteColor(status: ReturnType<typeof getSiteStatus>): string {
  switch (status) {
    case 'used': return '#ef4444'
    case 'recent': return '#f59e0b'
    case 'recommended': return '#22c55e'
    case 'available': return '#e2e8f0'
  }
}

interface InjectionSiteRotationProps {
  profileId: string
}

export function InjectionSiteRotation({ profileId }: InjectionSiteRotationProps) {
  const [selected, setSelected] = useState<InjectionSite | null>(null)
  const [saved, setSaved] = useState(false)

  const { records: injections, addInjection } = useInjectionLogs(profileId)

  const recommended = INJECTION_SITES.map(s => ({
    ...s,
    status: getSiteStatus(s.id, injections),
  })).find(s => s.status === 'recommended' || s.status === 'available')

  const handleSave = async () => {
    if (!selected) return
    const lastDosage = injections[0]?.dosage || 0.25
    await addInjection(selected, lastDosage)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSelected(null)
    }, 2000)
  }

  const selectedStatus = selected ? getSiteStatus(selected, injections) : null
  const selectedInfo = selected ? INJECTION_SITES.find(s => s.id === selected) : null
  const lastUsedDate = selected ? injections.find(r => r.site === selected)?.date : null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">注射部位ローテーション</h1>

      <Card className="overflow-visible bg-gradient-to-b from-blue-50/50 to-white dark:from-card dark:to-card">
        <CardContent className="pt-5 overflow-visible">
          <p className="text-sm text-muted-foreground mb-3">タップして今回の注射部位を選択してください</p>

          <div className="flex justify-center overflow-visible">
            <div className="relative w-64 overflow-visible">
              <Image src="/body-map.png" alt="注射部位マップ" width={512} height={700} className="w-full h-auto" priority />
              {INJECTION_SITES.map((site) => {
                const isSelected = selected === site.id
                const status = getSiteStatus(site.id, injections)
                const color = isSelected ? '#3b82f6' : getSiteColor(status)
                const pos = SITE_POSITIONS[site.id]
                const isRecommended = recommended?.id === site.id
                return (
                  <button
                    key={site.id}
                    onClick={() => setSelected(site.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all z-10"
                    style={{
                      left: `${pos.x}%`, top: `${pos.y}%`,
                      width: isSelected ? 40 : 32, height: isSelected ? 40 : 32,
                      backgroundColor: color, opacity: 0.55,
                      border: isSelected ? '3px solid #1d4ed8' : '2px solid transparent',
                    }}
                  >
                    {isRecommended && !selected && <span className="text-white text-xs font-bold">★</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {INJECTION_SITES.map((site) => {
              const isSelected = selected === site.id
              const status = getSiteStatus(site.id, injections)
              const isRecommended = recommended?.id === site.id
              const statusLabel = status === 'used' ? '今週' : status === 'recent' ? '1-2週前' : status === 'recommended' ? 'おすすめ' : ''
              return (
                <button
                  key={`btn-${site.id}`}
                  onClick={() => setSelected(site.id)}
                  className={cn(
                    "p-2 rounded-lg text-xs font-medium border-2 transition-all",
                    isSelected ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                  )}
                >
                  {site.label}{isRecommended && " ★"}
                  {statusLabel && <span className="block text-[10px] text-gray-400 mt-0.5">{statusLabel}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />今週使用</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />1-2週前</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />おすすめ</div>
          </div>
        </CardContent>
      </Card>

      {selected && selectedInfo && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{selectedInfo.label}</h3>
              {recommended?.id === selected && <Badge className="bg-green-500">おすすめ</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {lastUsedDate ? `最後の使用: ${formatDate(lastUsedDate)}` : "まだ使用していません"}
            </p>
            {selectedStatus === 'used' && (
              <p className="text-xs text-destructive mb-2">今週使用済みです。別の部位を選んでください。</p>
            )}
            <Button onClick={handleSave} className="w-full" disabled={saved}>
              {saved ? "✅ 記録しました" : "この部位で記録する"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">使用履歴</CardTitle></CardHeader>
        <CardContent>
          {injections.length > 0 ? (
            <div className="space-y-2">
              {injections.map((record) => {
                const site = INJECTION_SITES.find(s => s.id === record.site)
                return (
                  <div key={record.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-foreground">{site?.label}</span>
                    <span className="text-gray-400 dark:text-gray-500">{formatDate(record.date)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">履歴がありません</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">💡 注射部位のポイント</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>同じ部位への連続注射は避けましょう（最低2cm離す）</li>
            <li>お腹・太もも・上腕の3エリアをローテーションが理想</li>
            <li>硬結（しこり）がある場所は避けてください</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
