import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { DistrictCount, SourceCount } from "@/types";
import { HospitalCount } from "@/data/mockData";
import { AlertTriangle, TrendingUp } from "lucide-react";

// -------- District Bar Chart --------
interface DistrictChartProps {
  data: DistrictCount[];
}

export const DistrictBarChart: React.FC<DistrictChartProps> = ({ data }) => {
  const top8 = data.slice(0, 8);
  const maxCount = Math.max(...top8.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top8} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="district"
          tick={{ fontSize: 11, fill: "hsl(240 10% 3.9%)" }}
          width={90}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            border: "none",
            boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            fontFamily: "'Public Sans', sans-serif",
          }}
          cursor={{ fill: "hsl(240 5% 94%)" }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {top8.map((entry, i) => {
            // Heatmap: worst (highest count) → red, best → blue
            const ratio = entry.count / maxCount;
            const hue = ratio >= 0.8 ? 0 : ratio >= 0.5 ? 25 : 221;
            const saturation = ratio >= 0.5 ? 83 : 70;
            return (
              <Cell
                key={i}
                fill={`hsl(${hue} ${saturation}% ${Math.max(40, 65 - i * 4)}%)`}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// -------- Source Bar Chart --------
interface SourceChartProps {
  data: SourceCount[];
}

export const SourceBarChart: React.FC<SourceChartProps> = ({ data }) => {
  const top6 = data.slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={top6} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis
          dataKey="source"
          tick={{ fontSize: 10, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={48}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            border: "none",
            boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            fontFamily: "'Public Sans', sans-serif",
          }}
          cursor={{ fill: "hsl(240 5% 94%)" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32} fill="hsl(221 83% 53%)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// -------- Severity Donut --------
const SEVERITY_COLORS = {
  Confirmed: "hsl(0 84% 60%)",
  Probable: "hsl(38 92% 50%)",
};

interface SeverityDonutProps {
  confirmed: number;
  probable: number;
}

export const SeverityDonut: React.FC<SeverityDonutProps> = ({ confirmed, probable }) => {
  const data = [
    { name: "Confirmed", value: confirmed },
    { name: "Probable", value: probable },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: "none",
              boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: SEVERITY_COLORS[d.name as keyof typeof SEVERITY_COLORS],
              }}
            />
            <span className="text-sm text-foreground font-medium tabular">{d.value}</span>
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------- District Heatmap --------
interface DistrictHeatmapProps {
  data: DistrictCount[];
}

export const DistrictHeatmap: React.FC<DistrictHeatmapProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Color scale: low → light blue, medium → orange, high → deep red
  function heatColor(count: number): string {
    const ratio = count / maxCount;
    if (ratio >= 0.75) return "hsl(0 84% 60%)";
    if (ratio >= 0.5) return "hsl(25 95% 53%)";
    if (ratio >= 0.25) return "hsl(38 92% 50%)";
    return "hsl(221 83% 75%)";
  }

  function heatLabel(count: number): string {
    const ratio = count / maxCount;
    if (ratio >= 0.75) return "Critical";
    if (ratio >= 0.5) return "High";
    if (ratio >= 0.25) return "Medium";
    return "Low";
  }

  const worst = data[0];

  return (
    <div>
      {/* Worst district callout */}
      {worst && (
        <div className="flex items-start gap-3 p-3 mb-4 rounded-lg bg-destructive/8 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-destructive">
              Worst District: {worst.district}
            </div>
            <div className="text-xs text-muted-foreground">
              {worst.count} incident{worst.count !== 1 ? "s" : ""} reported — highest in UP
            </div>
          </div>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="grid grid-cols-4 gap-2">
        {data.map((d) => (
          <div
            key={d.district}
            className="relative rounded-lg p-2.5 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-default"
            style={{ backgroundColor: heatColor(d.count), minHeight: 64 }}
            title={`${d.district}: ${d.count} incident${d.count !== 1 ? "s" : ""}`}
          >
            <div className="text-[11px] font-bold text-white leading-tight drop-shadow-sm">
              {d.district}
            </div>
            <div className="text-lg font-extrabold text-white tabular mt-0.5 drop-shadow-sm">
              {d.count}
            </div>
            <div className="text-[9px] text-white/80 uppercase tracking-wide mt-0.5">
              {heatLabel(d.count)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 justify-end">
        {[
          { label: "Low", color: "hsl(221 83% 75%)" },
          { label: "Medium", color: "hsl(38 92% 50%)" },
          { label: "High", color: "hsl(25 95% 53%)" },
          { label: "Critical", color: "hsl(0 84% 60%)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------- Worst Hospital Table --------
interface HospitalRankingProps {
  data: HospitalCount[];
}

export const HospitalRankingTable: React.FC<HospitalRankingProps> = ({ data }) => {
  const top5 = data.slice(0, 5);
  const maxCount = Math.max(...top5.map((h) => h.count), 1);

  return (
    <div className="space-y-2">
      {top5.length === 0 && (
        <div className="text-sm text-muted-foreground py-6 text-center">No hospital data</div>
      )}
      {top5.map((h, i) => {
        const ratio = h.count / maxCount;
        const barColor =
          ratio >= 0.75
            ? "bg-destructive"
            : ratio >= 0.5
            ? "bg-orange-500"
            : ratio >= 0.25
            ? "bg-warning"
            : "bg-primary/60";

        return (
          <div key={h.hospital} className="flex items-center gap-3">
            {/* Rank */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white ${
                i === 0 ? "bg-destructive" : i === 1 ? "bg-orange-500" : "bg-muted-foreground/60"
              }`}
            >
              {i + 1}
            </div>

            {/* Name + district */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{h.hospital}</div>
              <div className="text-[10px] text-muted-foreground">{h.district}</div>
            </div>

            {/* Bar + count */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${(h.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular text-foreground w-4 text-right">
                {h.count}
              </span>
              {h.negligenceCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-destructive">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {h.negligenceCount} neg.
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
