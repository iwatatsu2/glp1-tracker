"use client";

import { useState } from "react";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InjectionSite, INJECTION_SITE_LABELS } from "@/lib/types";
import { demoInjectionSites } from "@/lib/demo-data";

// Positions as percentages relative to the body-map image (detected from teal circles)
const SITES: { id: InjectionSite; x: number; y: number }[] = [
  { id: "arm_left", x: 32.5, y: 32.7 },
  { id: "arm_right", x: 67.5, y: 32.7 },
  { id: "abdomen_left", x: 43.2, y: 42.7 },
  { id: "abdomen_right", x: 56.8, y: 42.6 },
  { id: "thigh_left", x: 42.0, y: 62.4 },
  { id: "thigh_right", x: 57.9, y: 62.4 },
];

function getLastUsed(site: InjectionSite): { weeksAgo: number | null; date: string | null } {
  const record = demoInjectionSites
    .filter((s) => s.site === site)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
  if (!record) return { weeksAgo: null, date: null };
  const weeksAgo = Math.floor(
    (Date.now() - new Date(record.recorded_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return { weeksAgo, date: new Date(record.recorded_at).toLocaleDateString("ja-JP") };
}

function getSiteColor(site: InjectionSite): string {
  const { weeksAgo } = getLastUsed(site);
  if (weeksAgo === null) return "#e2e8f0"; // unused - gray
  if (weeksAgo === 0) return "#ef4444"; // this week - red
  if (weeksAgo <= 2) return "#f59e0b"; // 1-2 weeks - amber
  return "#22c55e"; // 3+ weeks - green (recommended)
}

export default function InjectionSitePage() {
  const [selected, setSelected] = useState<InjectionSite | null>(null);
  const [saved, setSaved] = useState(false);

  // Find recommended site (longest since used or never used)
  const recommended = SITES.map((s) => ({
    ...s,
    lastUsed: getLastUsed(s.id),
  })).sort((a, b) => {
    if (a.lastUsed.weeksAgo === null) return -1;
    if (b.lastUsed.weeksAgo === null) return 1;
    return b.lastUsed.weeksAgo - a.lastUsed.weeksAgo;
  })[0];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelected(null);
    }, 2000);
  };

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold pt-2">注射部位ローテーション</h1>

        <Card className="overflow-visible">
          <CardContent className="pt-5 overflow-visible">
            <p className="text-sm text-gray-500 mb-3">
              タップして今回の注射部位を選択してください
            </p>

            {/* Body Map with overlay markers */}
            <div className="flex justify-center overflow-visible">
              <div className="relative w-64 overflow-visible">
                <Image
                  src="/body-map.png"
                  alt="注射部位マップ"
                  width={512}
                  height={700}
                  className="w-full h-auto"
                  priority
                />
                {/* Clickable overlay markers */}
                {SITES.map((site) => {
                  const isSelected = selected === site.id;
                  const isRecommended = recommended.id === site.id;
                  const color = isSelected ? "#3b82f6" : getSiteColor(site.id);
                  return (
                    <button
                      key={site.id}
                      onClick={() => setSelected(site.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all z-10"
                      style={{
                        left: `${site.x}%`,
                        top: `${site.y}%`,
                        width: isSelected ? 40 : 32,
                        height: isSelected ? 40 : 32,
                        backgroundColor: color,
                        opacity: 0.55,
                        border: isSelected ? "3px solid #1d4ed8" : "2px solid transparent",
                      }}
                    >
                      {isRecommended && !selected && (
                        <span className="text-white text-xs font-bold">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Site selection buttons (backup for hard-to-tap areas) */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {SITES.map((site) => {
                const isSelected = selected === site.id;
                const { weeksAgo } = getLastUsed(site.id);
                const isRecommended = recommended.id === site.id;
                return (
                  <button
                    key={`btn-${site.id}`}
                    onClick={() => setSelected(site.id)}
                    className={`p-2 rounded-lg text-xs font-medium border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {INJECTION_SITE_LABELS[site.id]}
                    {isRecommended && " ★"}
                    {weeksAgo !== null && (
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {weeksAgo === 0 ? "今週" : `${weeksAgo}週前`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />
                今週使用
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
                1-2週前
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
                おすすめ
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected site info */}
        {selected && (
          <Card className="border-blue-200">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {INJECTION_SITE_LABELS[selected]}
                </h3>
                {recommended.id === selected && (
                  <Badge className="bg-green-500">おすすめ</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {getLastUsed(selected).date
                  ? `最後の使用: ${getLastUsed(selected).date}（${getLastUsed(selected).weeksAgo}週間前）`
                  : "まだ使用していません"}
              </p>
              <Button onClick={handleSave} className="w-full" disabled={saved}>
                {saved ? "✅ 記録しました" : "この部位で記録する"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">使用履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoInjectionSites.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">
                    {INJECTION_SITE_LABELS[record.site]}
                  </span>
                  <span className="text-gray-400">
                    {new Date(record.recorded_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 注射部位のポイント</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>同じ部位への連続注射は避けましょう（最低2cm離す）</li>
              <li>お腹・太もも・上腕の3エリアをローテーションが理想</li>
              <li>硬結（しこり）がある場所は避けてください</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
