interface Props {
  completed: number;
  inProgress: number;
  assigned: number;
  rate: number;
  size?: "sm" | "lg";
}

export function CompletionDonut({
  completed,
  inProgress,
  assigned,
  rate,
  size = "lg",
}: Props) {
  const r = 62;
  const circ = 2 * Math.PI * r;
  const cDash = assigned > 0 ? (completed  / assigned) * circ : 0;
  const pDash = assigned > 0 ? (inProgress / assigned) * circ : 0;
  const notStarted = Math.max(0, assigned - completed - inProgress);

  return (
    <>
      <svg
        viewBox="0 0 200 200"
        className={size === "lg" ? "w-full h-40 mb-5" : "w-full h-20 mb-1"}
      >
        <circle cx="100" cy="100" r={r} fill="none" stroke="#f0fdf4" strokeWidth="16" />

        {assigned === 0 ? (
          <circle
            cx="100" cy="100" r={r}
            fill="none" stroke="#e5e7eb" strokeWidth="16"
            strokeDasharray={`${circ * 0.35} ${circ}`}
            strokeLinecap="round"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
        ) : (
          <>
            <circle
              cx="100" cy="100" r={r}
              fill="none" stroke="#0d9488" strokeWidth="16"
              strokeDasharray={`${cDash} ${circ}`}
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
                transition: "stroke-dasharray .8s ease",
              }}
            />
            <circle
              cx="100" cy="100" r={r}
              fill="none" stroke="#5eead4" strokeWidth="16"
              strokeDasharray={`${pDash} ${circ}`}
              strokeDashoffset={-cDash}
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
                transition: "stroke-dasharray .8s ease",
              }}
            />
          </>
        )}

        <circle cx="100" cy="100" r="46" fill="white" />
        <text
          x="100" y="97"
          textAnchor="middle"
          fontSize={size === "lg" ? "24" : "18"}
          fontWeight="600"
          fill="#134e4a"
          fontFamily="Georgia, serif"
        >
          {rate}%
        </text>
        <text
          x="100" y="112"
          textAnchor="middle"
          fontSize="7.5"
          fill="#99f6e4"
          fontFamily="system-ui"
          letterSpacing="2"
        >
          COMPLETE
        </text>
      </svg>

      {size === "lg" && (
        <div className="space-y-3">
          {[
            { color: "bg-teal-600", label: "Completed",   val: completed  },
            { color: "bg-teal-300", label: "In Progress", val: inProgress },
            { color: "bg-gray-200", label: "Not Started", val: notStarted },
          ].map(({ color, label, val }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
              <span className="ml-auto text-xs font-semibold text-gray-800">{val}</span>
            </div>
          ))}
        </div>
      )}

      {size === "sm" && (
        <p className="text-[9px] text-center text-gray-400">
          {completed} done · {inProgress} active
        </p>
      )}
    </>
  );
}
