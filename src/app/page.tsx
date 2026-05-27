"use client"

import { useState } from "react"
import { TabBar, type TabId } from "@/components/tab-bar"
import { Dashboard } from "@/components/dashboard"
import { SideEffectsPage } from "@/components/side-effects-page"
import { InjectionSiteRotation } from "@/components/injection-site-rotation"
import { WeightDosageGraph } from "@/components/weight-dosage-graph"
import { SettingsScreen } from "@/components/settings-screen"
import { AboutPage } from "@/components/about-page"
import { AuthPage } from "@/components/auth-page"
import { useAuth } from "@/hooks/useAuth"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const { user, profileId, loading, purchased, signOut } = useAuth()

  if (loading || purchased === null && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-app">
        <div className="text-center">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-2xl text-white">💉</span>
          </div>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user || !profileId) {
    return <AuthPage />
  }

  if (!purchased) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-app px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
            <span className="text-3xl text-white">💉</span>
          </div>
          <h1 className="text-xl font-bold">GLP-1 Tracker</h1>
          <p className="text-sm text-muted-foreground">
            このアプリをご利用いただくには、MedApp Marketでの購入が必要です。
          </p>
          <a
            href="https://medapp-market.vercel.app/apps/glp1-tracker"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            購入ページへ
          </a>
          <button
            onClick={signOut}
            className="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setActiveTab} profileId={profileId} />
      case 'side-effects':
        return <SideEffectsPage profileId={profileId} />
      case 'sites':
        return <InjectionSiteRotation profileId={profileId} />
      case 'weight':
        return <WeightDosageGraph profileId={profileId} />
      case 'settings':
        return <SettingsScreen profileId={profileId} onSignOut={signOut} />
      case 'about':
        return <AboutPage onNavigate={setActiveTab} />
      default:
        return <Dashboard onNavigate={setActiveTab} profileId={profileId} />
    }
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-6 pb-24">
      {renderContent()}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
