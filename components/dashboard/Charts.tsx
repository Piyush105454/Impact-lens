"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { stroke: "hsl(148 8% 61%)", fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "hsl(153 33% 11%)", border: "1px solid hsl(150 28% 16%)", borderRadius: 12, fontSize: 12, color: "#F5F7F6" },
  labelStyle: { color: "#F5F7F6", fontWeight: 600 },
  cursor: { fill: "hsl(150 28% 16% / 0.4)" },
};

export function MediaActivityChart({ data }: { data: { month: string; uploaded: number; analyzed: number }[] }) {
  return (
    <div className="h-64" role="img" aria-label="Media uploaded and analyzed per month">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="g-up" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5DB7DE" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5DB7DE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-an" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(150 28% 16%)" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltipStyle} cursor={{ stroke: "hsl(150 28% 25%)" }} />
          <Area type="monotone" dataKey="uploaded" name="Uploaded" stroke="#5DB7DE" strokeWidth={2} fill="url(#g-up)" />
          <Area type="monotone" dataKey="analyzed" name="AI analyzed" stroke="#22C55E" strokeWidth={2} fill="url(#g-an)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectProgressChart({ data }: { data: { name: string; analyzed: number; media: number }[] }) {
  return (
    <div className="h-64" role="img" aria-label="AI analysis progress by project">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10}>
          <CartesianGrid stroke="hsl(150 28% 16%)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} unit="%" {...axis} />
          <YAxis type="category" dataKey="name" width={150} {...axis} tick={{ fill: "hsl(150 11% 90%)", fontSize: 12 }} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "AI analyzed"]} />
          <Bar dataKey="analyzed" name="AI analyzed" fill="#22C55E" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
