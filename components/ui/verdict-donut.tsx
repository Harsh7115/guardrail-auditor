"use client";

import { PieChart, Pie, Cell } from "recharts";
import { verdictChartColor } from "@/lib/verdict";

type Counts = { pass: number; warning: number; fail: number };

// Verdict split as a donut with a text legend carrying the counts — counts are
// the accessible source of truth, the donut is decorative. Uses a fixed-size
// PieChart (not ResponsiveContainer) so it renders deterministically on first
// paint instead of waiting for a resize to measure its container.
const SIZE = 168;

export function VerdictDonut({ counts }: { counts: Counts }) {
  const total = counts.pass + counts.warning + counts.fail;
  const data = [
    { name: "Pass", value: counts.pass, color: verdictChartColor.pass },
    { name: "Warn", value: counts.warning, color: verdictChartColor.warning },
    { name: "Fail", value: counts.fail, color: verdictChartColor.fail }
  ];
  const safeData = total === 0 ? [{ name: "None", value: 1, color: "#F0EFEA" }] : data;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <PieChart width={SIZE} height={SIZE}>
          <Pie
            data={safeData}
            dataKey="value"
            nameKey="name"
            cx={SIZE / 2}
            cy={SIZE / 2}
            innerRadius={54}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={total === 0 ? 0 : 2}
            isAnimationActive={false}
          >
            {safeData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center leading-none">
            <div className="text-2xl font-[680] text-ink">{total}</div>
            <div className="font-mono text-[0.625rem] uppercase tracking-wide text-ink-4">tests</div>
          </div>
        </div>
      </div>
      <ul className="mt-4 flex w-full flex-col gap-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-3">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} aria-hidden />
              {d.name}
            </span>
            <span className="font-mono text-ink-2">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
