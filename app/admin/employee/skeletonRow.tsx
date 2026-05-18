export function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      {[180, 80, 60, 60, 60, 60, 120, 60].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-3 bg-slate-800 rounded animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}