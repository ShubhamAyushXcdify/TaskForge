import { useMemo } from "react";
import { Sk, EmptyState } from "@/app/(app)/dashboard/components/SharedUI";
import type { WeeklyHours } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  weeklyHours: WeeklyHours;
  loading: boolean;
}

export function WeeklyChart({ weeklyHours, loading }: Props) {
  const chart = useMemo(() => {
    const empty = {
      thisPath: "",
      lastPath: "",
      dots: [] as { x: number; y: number }[],
      labels: [] as { label: string; x: number }[],
    };

    if (!weeklyHours.thisWeek.length) return empty;

    const tw = weeklyHours.thisWeek;
    const lw = weeklyHours.lastWeek;
    const maxH = Math.max(...tw.map(d => d.hours), ...lw.map(d => d.hours), 1);
    const toY  = (h: number) => 148 - (h / maxH) * 118;
    const xs   = tw.map((_, i) => 55 + i * ((700 - 55) / Math.max(tw.length - 1, 1)));

    return {
      thisPath: tw
        .map((d, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${toY(d.hours).toFixed(1)}`)
        .join(" "),
      lastPath: lw
        .slice(0, tw.length)
        .map((d, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${toY(d.hours).toFixed(1)}`)
        .join(" "),
      dots:   tw.map((d, i) => ({ x: xs[i], y: toY(d.hours) })),
      labels: tw.map((d, i) => ({ label: d.day, x: xs[i] })),
    };
  }, [weeklyHours]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Weekly Learning Hours
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Compared to last week</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px bg-gray-200" />Last week
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px bg-teal-500" />This week
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-48">
        {loading ? (
          <Sk className="absolute inset-0 h-full" />
        ) : weeklyHours.thisWeek.length === 0 ? (
          <>
            <svg width="100%" height="100%" viewBox="0 0 740 175" className="absolute inset-0 opacity-30">
              {[35, 75, 115, 150].map(y => (
                <line key={y} x1="48" y1={y} x2="720" y2={y}
                  stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5 4" />
              ))}
              <path d="M55,130 L700,130" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState icon="📊" label="No sessions yet" sub="Start a course to track your hours" />
            </div>
          </>
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 740 175" preserveAspectRatio="none" className="absolute inset-0">
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0d9488" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0"    />
              </linearGradient>
            </defs>

            {[35, 75, 115, 150].map(y => (
              <line key={y} x1="48" y1={y} x2="720" y2={y} stroke="#f9fafb" strokeWidth="1.5" />
            ))}

            {[["6h", 35], ["4h", 75], ["2h", 115], ["0", 150]].map(([l, y]) => (
              <text key={String(y)} x="40" y={Number(y) + 4} fontSize="8.5" fill="#d1d5db" textAnchor="end">
                {l}
              </text>
            ))}

            {chart.lastPath && (
              <path d={chart.lastPath} fill="none" stroke="#e5e7eb" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {chart.thisPath && chart.dots.length > 0 && (
              <path
                d={`${chart.thisPath} L${chart.dots.at(-1)!.x.toFixed(1)},158 L${chart.dots[0].x.toFixed(1)},158 Z`}
                fill="url(#cg)"
              />
            )}

            {chart.thisPath && (
              <path d={chart.thisPath} fill="none" stroke="#0d9488" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {chart.dots.map(({ x, y }, i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#0d9488" opacity="0.1" />
                <circle cx={x} cy={y} r="3" fill="#0d9488" stroke="white" strokeWidth="2" />
              </g>
            ))}

            {chart.labels.map(({ label, x }) => (
              <text key={x} x={x} y="172" fontSize="8.5" fill="#9ca3af" textAnchor="middle" fontWeight="500">
                {label}
              </text>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
