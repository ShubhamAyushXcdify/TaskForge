import { EmptyState } from "@/app/(app)/dashboard/components/SharedUI";
import type { CategoryBreakdown } from "@/app/(app)/dashboard/components/dashboard";

const STROKES = ["#0d9488", "#14b8a6", "#2dd4bf", "#99f6e4", "#ccfbf1"];

interface Props {
  data: CategoryBreakdown[];
  size?: "sm" | "lg";
}

export function CategoryDonut({ data: cats, size = "lg" }: Props) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <>
      <svg
        viewBox="0 0 200 200"
        className={size === "lg" ? "w-full h-36 mb-4" : "w-full h-20"}
      >
        <circle cx="100" cy="100" r={r} fill="none" stroke="#f0fdf4" strokeWidth="22" />

        {cats.length === 0 ? (
          <circle
            cx="100" cy="100" r={r}
            fill="none" stroke="#e5e7eb" strokeWidth="22"
            strokeDasharray={`${circ * 0.5} ${circ}`}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
        ) : (
          cats.map(({ percentage }, i) => {
            const dash = (percentage / 100) * circ;
            const el = (
              <circle
                key={i}
                cx="100" cy="100" r={r}
                fill="none"
                stroke={STROKES[i % STROKES.length]}
                strokeWidth="22"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={-offset}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
              />
            );
            offset += dash;
            return el;
          })
        )}

        <circle cx="100" cy="100" r="36" fill="white" />

        {cats.length > 0 && (
          <>
            <text
              x="100" y="97"
              textAnchor="middle"
              fontSize="15"
              fontWeight="600"
              fill="#134e4a"
              fontFamily="Georgia,serif"
            >
              {cats[0].percentage}%
            </text>
            <text
              x="100" y="110"
              textAnchor="middle"
              fontSize="7"
              fill="#99f6e4"
              fontFamily="system-ui"
              letterSpacing="1"
            >
              TOP
            </text>
          </>
        )}
      </svg>

      {size === "lg" && cats.length > 0 && (
        <div className="space-y-2.5">
          {cats.map(({ category, count, percentage }, i) => (
            <div key={category} className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: STROKES[i % STROKES.length] }}
              />
              <span className="text-xs text-gray-500 truncate">{category}</span>
              <span className="ml-auto text-[10px] font-semibold text-gray-700 shrink-0">
                {percentage}% · {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {size === "lg" && cats.length === 0 && (
        <EmptyState icon="📂" label="No categories yet" />
      )}
    </>
  );
}
