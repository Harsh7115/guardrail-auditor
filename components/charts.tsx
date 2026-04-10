"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

type Props = {
  categoryScores: Record<string, { score: number; count: number }>;
  verdictCounts: { pass: number; warning: number; fail: number };
  overall: number;
};

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function AuditCharts({ categoryScores, verdictCounts, overall }: Props) {
  const barData = Object.entries(categoryScores).map(([category, { score }]) => ({ category, score: Math.round(score) }));
  const pieData = [
    { name: "Pass", value: verdictCounts.pass, color: COLORS[0] },
    { name: "Warning", value: verdictCounts.warning, color: COLORS[1] },
    { name: "Fail", value: verdictCounts.fail, color: COLORS[2] }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card p-4 col-span-2">
        <div className="flex items-center justify-between mb-2">
          <p className="section-title">Category breakdown</p>
          <span className="text-sm text-slate-500">Overall {Math.round(overall)} / 100</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-4">
        <p className="section-title mb-2">Verdicts</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around text-sm text-slate-600">
          {pieData.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name} ({p.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
