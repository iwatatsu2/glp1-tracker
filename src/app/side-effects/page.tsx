"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Symptom,
  SYMPTOM_LABELS,
  SEVERITY_FACES,
} from "@/lib/types";
import { demoInjectionLogs, demoSideEffects } from "@/lib/demo-data";
import Link from "next/link";

const SYMPTOM_ICONS: Record<Symptom, string> = {
  nausea: "🤢",
  vomiting: "🤮",
  constipation: "💩",
  diarrhea: "💨",
  headache: "🤕",
  fatigue: "😴",
  appetite_loss: "🍽️",
  injection_site_pain: "💉",
  other: "❓",
};

export default function SideEffectsPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [severity, setSeverity] = useState(5);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);

  // Calculate days since last injection
  const lastInjection = demoInjectionLogs.find((l) => l.status === "confirmed");
  const daysSince = lastInjection
    ? Math.floor(
        (Date.now() - new Date(lastInjection.scheduled_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const handleSave = () => {
    // TODO: Save to Supabase
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelectedSymptom(null);
      setMemo("");
      setSeverity(5);
    }, 2000);
  };

  // Recent records
  const recentRecords = demoSideEffects.slice(0, 5);

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-xl font-bold">副作用を記録</h1>
          <Link href="/side-effects/analysis">
            <Button variant="outline" size="sm">
              分析を見る
            </Button>
          </Link>
        </div>

        {/* Days since injection indicator */}
        {daysSince !== null && (
          <Card
            className={`${
              daysSince >= 1 && daysSince <= 3
                ? "border-amber-200 bg-amber-50"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💉</span>
                <span className="text-sm font-medium">
                  注射後 <strong className="text-lg">{daysSince}</strong> 日目
                </span>
                {daysSince >= 1 && daysSince <= 3 && (
                  <Badge className="bg-amber-500 text-xs ml-auto">
                    副作用が出やすい時期
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptom Selection */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            症状を選んでください
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(SYMPTOM_LABELS) as Symptom[]).map((symptom) => (
              <button
                key={symptom}
                onClick={() => setSelectedSymptom(symptom)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  selectedSymptom === symptom
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{SYMPTOM_ICONS[symptom]}</span>
                <span className="text-xs font-medium">
                  {SYMPTOM_LABELS[symptom]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Slider */}
        {selectedSymptom && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="text-center">
                <span className="text-4xl">{SEVERITY_FACES[severity]}</span>
                <p className="text-sm text-gray-500 mt-1">
                  重症度: <strong className="text-lg">{severity}</strong> / 10
                </p>
              </div>
              <Slider
                value={[severity]}
                onValueChange={(v) => setSeverity(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>なし</span>
                <span>軽い</span>
                <span>中等度</span>
                <span>強い</span>
                <span>最大</span>
              </div>

              {/* Memo */}
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモ（任意）: 食後に悪化した、など"
                className="w-full p-3 border rounded-lg text-sm resize-none h-20"
              />

              {/* Tips */}
              {selectedSymptom === "nausea" && (
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                  <strong>💡 嘔気のヒント:</strong> 少量ずつゆっくり食べる、脂っこいものを避ける、
                  食後すぐに横にならないことが効果的です。
                </div>
              )}
              {selectedSymptom === "constipation" && (
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                  <strong>💡 便秘のヒント:</strong> 水分を十分に取り、食物繊維を意識しましょう。
                  改善しない場合は主治医に相談してください。
                </div>
              )}
              {selectedSymptom === "vomiting" && (
                <div className="bg-red-50 p-3 rounded-lg text-xs text-red-700">
                  <strong>⚠️ 注意:</strong> 嘔吐が続く場合は脱水に注意し、
                  早めに主治医に相談してください。
                </div>
              )}

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={saved}
              >
                {saved ? "✅ 保存しました" : "記録する"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Records */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">最近の記録</h2>
          <div className="space-y-2">
            {recentRecords.map((se) => (
              <Card key={se.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{SYMPTOM_ICONS[se.symptom]}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {SYMPTOM_LABELS[se.symptom]}
                      </p>
                      <p className="text-xs text-gray-400">
                        注射後{se.days_after_injection}日目
                        {se.memo && ` · ${se.memo}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{SEVERITY_FACES[se.severity]}</span>
                    <span className="text-xs text-gray-500">{se.severity}/10</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
