"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoWeightLogs, demoDoseChanges } from "@/lib/demo-data";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [saved, setSaved] = useState(false);

  const chartData = demoWeightLogs.map((d) => ({
    date: new Date(d.recorded_date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
    weight: Math.round(d.weight * 10) / 10,
    bodyFat: d.body_fat ? Math.round(d.body_fat * 10) / 10 : null,
    rawDate: d.recorded_date,
  }));

  // Dose change reference lines
  const doseLines = demoDoseChanges.map((d) => {
    const matchingData = chartData.find(
      (c) => c.rawDate <= d.changed_date
    );
    return {
      date: new Date(d.changed_date).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      dose: d.dose,
      index: matchingData ? chartData.indexOf(matchingData) : 0,
    };
  });

  // Stats
  const firstWeight = demoWeightLogs[0]?.weight;
  const lastWeight = demoWeightLogs[demoWeightLogs.length - 1]?.weight;
  const totalChange = lastWeight && firstWeight ? lastWeight - firstWeight : 0;
  const currentBMI = lastWeight ? (lastWeight / (1.7 * 1.7)).toFixed(1) : "—";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setWeight("");
      setBodyFat("");
    }, 2000);
  };

  // Dose period colors for background areas
  const doseColors = ["#dbeafe", "#e0e7ff", "#fef3c7"];

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold pt-2">体重記録</h1>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold">
                {lastWeight ? Math.round(lastWeight * 10) / 10 : "—"}
              </p>
              <p className="text-xs text-gray-500">現在(kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p
                className={`text-xl font-bold ${
                  totalChange < 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalChange > 0 ? "+" : ""}
                {Math.round(totalChange * 10) / 10}
              </p>
              <p className="text-xs text-gray-500">変化(kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold">{currentBMI}</p>
              <p className="text-xs text-gray-500">BMI</p>
            </CardContent>
          </Card>
        </div>

        {/* Weight + Dose Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">体重推移 × 用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  {/* Dose period backgrounds */}
                  {demoDoseChanges.map((dose, i) => {
                    const startDate = new Date(dose.changed_date).toLocaleDateString(
                      "ja-JP",
                      { month: "short", day: "numeric" }
                    );
                    const endDate =
                      i < demoDoseChanges.length - 1
                        ? new Date(
                            demoDoseChanges[i + 1].changed_date
                          ).toLocaleDateString("ja-JP", {
                            month: "short",
                            day: "numeric",
                          })
                        : chartData[chartData.length - 1]?.date;

                    return (
                      <ReferenceArea
                        key={dose.id}
                        x1={startDate}
                        x2={endDate}
                        fill={doseColors[i % doseColors.length]}
                        fillOpacity={0.3}
                      />
                    );
                  })}

                  {/* Dose change lines */}
                  {demoDoseChanges.map((dose) => (
                    <ReferenceLine
                      key={dose.id}
                      x={new Date(dose.changed_date).toLocaleDateString(
                        "ja-JP",
                        { month: "short", day: "numeric" }
                      )}
                      stroke="#6366f1"
                      strokeDasharray="3 3"
                      label={{
                        value: dose.dose,
                        position: "top",
                        fontSize: 10,
                        fill: "#6366f1",
                      }}
                    />
                  ))}

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      `${value} ${name === "weight" ? "kg" : "%"}`,
                      name === "weight" ? "体重" : "体脂肪率",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Dose legend */}
            <div className="flex flex-wrap gap-2 mt-2">
              {demoDoseChanges.map((dose, i) => (
                <Badge
                  key={dose.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: doseColors[i % doseColors.length],
                    borderColor: "#6366f1",
                  }}
                >
                  {dose.dose}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Record Weight */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">今日の体重を記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例: 80.5"
                className="w-full mt-1 p-3 border rounded-lg text-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                体脂肪率 (%) - 任意
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="例: 25.0"
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!weight || saved}
            >
              {saved ? "✅ 保存しました" : "記録する"}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">記録履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...demoWeightLogs].reverse().slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-500">
                    {new Date(log.recorded_date).toLocaleDateString("ja-JP")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {Math.round(log.weight * 10) / 10} kg
                    </span>
                    {log.body_fat && (
                      <span className="text-gray-400">
                        {Math.round(log.body_fat * 10) / 10}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
