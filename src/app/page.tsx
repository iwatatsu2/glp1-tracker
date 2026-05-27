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
  const { user, profileId, loading, signOut } = useAuth()

  if (loading) {
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
