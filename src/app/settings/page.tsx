"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold pt-2">設定</h1>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">プロフィール</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">身長</span>
              <span className="font-medium">170 cm</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">目標体重</span>
              <span className="font-medium">75.0 kg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">薬剤設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">薬剤</span>
              <Badge variant="secondary">ウゴービ</Badge>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">現在の用量</span>
              <span className="font-medium">1.0mg</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">注射曜日</span>
              <span className="font-medium">毎週火曜日</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">LINE連携</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">ステータス</span>
              <Badge className="bg-green-500">連携済み</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              LINE Botからリマインダー通知を受け取れます
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-400">GLP-1 Tracker v1.0</p>
              <p className="text-xs text-gray-400">
                開発・監修: Dr.いわたつ（糖尿病・内分泌専門医）
              </p>
              <div className="flex justify-center gap-3 text-xs">
                <a href="#" className="text-blue-500 hover:underline">
                  利用規約
                </a>
                <a href="#" className="text-blue-500 hover:underline">
                  プライバシーポリシー
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
