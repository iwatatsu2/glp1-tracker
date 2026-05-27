"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { SideEffectsRecord } from "./side-effects-record"
import { SideEffectsAnalysis } from "./side-effects-analysis"

interface SideEffectsPageProps {
  profileId: string
}

export function SideEffectsPage({ profileId }: SideEffectsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'record' | 'analysis'>('record')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveSubTab('record')}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-all",
            activeSubTab === 'record'
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          記録
        </button>
        <button
          onClick={() => setActiveSubTab('analysis')}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-all",
            activeSubTab === 'analysis'
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          分析
        </button>
      </div>
      {activeSubTab === 'record' ? <SideEffectsRecord profileId={profileId} /> : <SideEffectsAnalysis profileId={profileId} />}
    </div>
  )
}
