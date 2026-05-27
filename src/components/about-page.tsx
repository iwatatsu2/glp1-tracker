"use client"

import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TabId } from "./tab-bar"

interface AboutPageProps {
  onNavigate: (tab: TabId) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-1 text-sm text-primary"
      >
        <ArrowLeft className="size-4" />
        ホームに戻る
      </button>

      <h1 className="text-xl font-bold text-foreground">製作者について</h1>

      {/* Profile */}
      <Card className="bg-gradient-to-b from-blue-50/50 to-white dark:from-card dark:to-card">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-4">
            <Image
              src="/dr-iwatatsu.png"
              alt="Dr. いわたつ"
              width={240}
              height={240}
              className="w-full object-cover object-top"
              style={{ height: '200%' }}
            />
          </div>
          <h2 className="text-lg font-bold text-foreground">Dr. いわたつ</h2>
          <p className="text-sm text-primary mt-1">
            糖尿病・内分泌 専門医・指導医
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed text-left">
            糖尿病・内分泌内科の専門医として臨床に従事しながら、医療現場で本当に使えるツールを自ら開発しています。
          </p>
        </CardContent>
      </Card>

      {/* Apps */}
      <Card className="bg-gradient-to-b from-purple-50/30 to-white dark:from-card dark:to-card">
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">開発アプリ</h3>
          <a
            href="https://medapp-market.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <span className="text-lg text-white">🏥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">医療アプリまとめ</p>
              <p className="text-xs text-muted-foreground">開発した医療ツール一覧</p>
            </div>
          </a>
        </CardContent>
      </Card>

      {/* SNS */}
      <Card className="bg-gradient-to-b from-green-50/30 to-white dark:from-card dark:to-card">
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">SNS</h3>
          <div className="space-y-2">
            <a href="https://www.instagram.com/dr.iwatatsu/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors">
              <span className="text-sm text-foreground">Instagram</span>
              <span className="text-xs text-muted-foreground">@dr.iwatatsu</span>
            </a>
            <a href="https://x.com/KenKyu1019799" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors">
              <span className="text-sm text-foreground">X (Twitter)</span>
              <span className="text-xs text-muted-foreground">@KenKyu1019799</span>
            </a>
            <a href="https://slide.antaa.jp/profile/mtzDnleJ6DYJ" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors">
              <span className="text-sm text-foreground">antaaスライド</span>
              <span className="text-xs text-muted-foreground">医療スライド共有</span>
            </a>
            <a href="https://note.com/dr_iwatatsu" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors">
              <span className="text-sm text-foreground">note</span>
              <span className="text-xs text-muted-foreground">dr_iwatatsu</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* About this app */}
      <Card className="bg-gradient-to-b from-orange-50/30 to-white dark:from-card dark:to-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <span className="text-2xl text-white">💉</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">GLP-1 Tracker</h3>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GLP-1受容体作動薬による治療を、より安心して続けられるよう作りました。副作用の記録・注射部位の管理・体重推移の可視化をサポートします。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            ご意見・ご要望があれば、SNSからお気軽にご連絡ください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
