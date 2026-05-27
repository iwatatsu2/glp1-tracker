"use client"

import { useState } from "react"
import { TabBar, type TabId } from "@/components/tab-bar"
import { Dashboard } from "@/components/dashboard"
import { SideEffectsPage } from "@/components/side-effects-page"
import { InjectionSiteRotation } from "@/components/injection-site-rotation"
import { WeightDosageGraph } from "@/components/weight-dosage-graph"
import { SettingsScreen } from "@/components/settings-screen"
import { AboutPage } from "@/components/about-page"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setActiveTab} />
      case 'side-effects':
        return <SideEffectsPage />
      case 'sites':
        return <InjectionSiteRotation />
      case 'weight':
        return <WeightDosageGraph />
      case 'settings':
        return <SettingsScreen />
      case 'about':
        return <AboutPage onNavigate={setActiveTab} />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 pt-6 pb-24">
      {renderContent()}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
