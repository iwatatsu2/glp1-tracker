"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoSideEffects, demoDoseChanges } from "@/lib/demo-data";
import { SYMPTOM_LABELS, SEVERITY_FACES, Symptom } from "@/lib/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function AnalysisPage() {
  // 1. Days after injection pattern
  const dayPattern: Record<number, { count: number; totalSeverity: number }> = {};
  for (let i = 0; i <= 7; i++) dayPattern[i] = { count: 0, totalSeverity: 0 };

  demoSideEffects.forEach((se) => {
    if (se.days_after_injection !== null && se.days_after_injection <= 7) {
      dayPattern[se.days_after_injection].count++;
      dayPattern[se.days_after_injection].totalSeverity += se.severity;
    }
  });

  const dayChartData = Object.entries(dayPattern).map(([day, data]) => ({
    day: `${day}日目`,
    count: data.count,
    avgSeverity: data.count > 0 ? Math.round((data.totalSeverity / data.count) * 10) / 10 : 0,
  }));

  // 2. Symptom frequency
  const symptomFreq: Record<string, { count: number; totalSeverity: number }> = {};
  demoSideEffects.forEach((se) => {
    if (!symptomFreq[se.symptom]) symptomFreq[se.symptom] = { count: 0, totalSeverity: 0 };
    symptomFreq[se.symptom].count++;
    symptomFreq[se.symptom].totalSeverity += se.severity;
  });

  const symptomData = Object.entries(symptomFreq)
    .map(([symptom, data]) => ({
      symptom: SYMPTOM_LABELS[symptom as Symptom],
      count: data.count,
      avgSeverity: Math.round((data.totalSeverity / data.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Peak day
  const peakDay = dayChartData.reduce((max, d) => (d.count > max.count ? d : max), dayChartData[0]);

  // Bar colors
  const barColors = ["#dbeafe", "#93c5fd", "#f59e0b", "#f59e0b", "#ef4444", "#dbeafe", "#dbeafe", "#dbeafe"];

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold pt-2">副作用分析</h1>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{demoSideEffects.length}</p>
                <p className="text-xs text-gray-500">記録数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{peakDay.day}</p>
                <p className="text-xs text-gray-500">ピーク日</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    demoSideEffects.reduce((s, se) => s + se.severity, 0) /
                      demoSideEffects.length * 10
                  ) / 10}
                </p>
                <p className="text-xs text-gray-500">平均重症度</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days Pattern Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              注射後の日数別 副作用パターン
            </CardTitle>
            <p className="text-xs text-gray-500">
              注射後2〜3日目に副作用が集中する傾向があります
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayChartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      name === "count" ? `${value}件` : String(value),
                      name === "count" ? "件数" : "平均重症度",
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {dayChartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Symptom Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">症状別の頻度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symptomData.map((s) => (
                <div key={s.symptom} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 shrink-0">
                    {s.symptom}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full transition-all"
                      style={{
                        width: `${(s.count / Math.max(...symptomData.map((d) => d.count))) * 100}%`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {s.count}件
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {SEVERITY_FACES[Math.round(s.avgSeverity)]} {s.avgSeverity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dose change impact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">用量変更と副作用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoDoseChanges.map((dose, i) => {
                const doseDate = new Date(dose.changed_date);
                const nextDate = demoDoseChanges[i + 1]
                  ? new Date(demoDoseChanges[i + 1].changed_date)
                  : new Date();
                const periodSE = demoSideEffects.filter((se) => {
                  const d = new Date(se.recorded_at);
                  return d >= doseDate && d < nextDate;
                });
                const avgSev = periodSE.length > 0
                  ? Math.round(periodSE.reduce((s, se) => s + se.severity, 0) / periodSE.length * 10) / 10
                  : 0;

                return (
                  <div key={dose.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{dose.dose}</p>
                      <p className="text-xs text-gray-400">
                        {doseDate.toLocaleDateString("ja-JP")}〜
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        副作用 <strong>{periodSE.length}</strong>件
                      </p>
                      <p className="text-xs text-gray-400">
                        平均重症度 {avgSev}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
