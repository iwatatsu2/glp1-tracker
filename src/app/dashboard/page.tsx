"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { demoInjectionLogs, demoSideEffects, demoWeightLogs, demoDoseChanges } from "@/lib/demo-data";
import { SYMPTOM_LABELS, SEVERITY_FACES } from "@/lib/types";
import { WeightMiniChart } from "@/components/weight/weight-mini-chart";

export default function DashboardPage() {
  const latestInjection = demoInjectionLogs[0];
  const injectionDate = new Date(latestInjection.scheduled_at);
  const nextInjection = new Date(injectionDate);
  nextInjection.setDate(nextInjection.getDate() + 7);

  const daysSinceInjection = Math.floor(
    (Date.now() - injectionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Recent side effects (last 7 days)
  const recentSE = demoSideEffects.filter(
    (se) => Date.now() - new Date(se.recorded_at).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  const currentDose = demoDoseChanges[demoDoseChanges.length - 1];

  const showSideEffectWarning = daysSinceInjection >= 1 && daysSinceInjection <= 3;

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold">GLP-1 Tracker</h1>
          <p className="text-sm text-gray-500">今日の状態</p>
        </div>

        {/* Injection Status */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">最後の注射</p>
                <p className="text-lg font-semibold">
                  {injectionDate.toLocaleDateString("ja-JP")}
                </p>
                <p className="text-sm text-gray-400">
                  {daysSinceInjection}日前
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">次回予定</p>
                <p className="text-lg font-semibold text-blue-600">
                  {nextInjection.toLocaleDateString("ja-JP")}
                </p>
                {currentDose && (
                  <Badge variant="secondary">{currentDose.dose}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Effect Warning */}
        {showSideEffectWarning && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-800">
                    注射後{daysSinceInjection}日目
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    注射後2〜3日は嘔気・嘔吐・便秘などの副作用が出やすい時期です。
                    症状があれば記録しましょう。
                  </p>
                  <Link href="/side-effects">
                    <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
                      副作用を記録する
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/side-effects">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="pt-5 text-center">
                <span className="text-3xl">📋</span>
                <p className="text-sm font-medium mt-1">副作用を記録</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/weight">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="pt-5 text-center">
                <span className="text-3xl">📊</span>
                <p className="text-sm font-medium mt-1">体重を記録</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/injection-site">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="pt-5 text-center">
                <span className="text-3xl">💉</span>
                <p className="text-sm font-medium mt-1">注射部位</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/side-effects/analysis">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="pt-5 text-center">
                <span className="text-3xl">📈</span>
                <p className="text-sm font-medium mt-1">副作用分析</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Weight Mini Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">体重推移</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightMiniChart data={demoWeightLogs} />
          </CardContent>
        </Card>

        {/* Recent Side Effects */}
        {recentSE.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">今週の副作用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSE.slice(0, 3).map((se) => (
                  <div key={se.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{SEVERITY_FACES[se.severity]}</span>
                      <span>{SYMPTOM_LABELS[se.symptom]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">
                        注射後{se.days_after_injection}日目
                      </span>
                      <Badge variant="outline">重症度 {se.severity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
