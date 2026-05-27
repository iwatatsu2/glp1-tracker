"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { WeightLog } from "@/lib/types";

export function WeightMiniChart({ data }: { data: WeightLog[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.recorded_date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
    weight: Math.round(d.weight * 10) / 10,
  }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
            formatter={(value: unknown) => [`${value} kg`, "体重"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
