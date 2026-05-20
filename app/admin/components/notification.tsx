export function Overview()      { return <ComingSoon label="Overview"      /> }
export function Assignments()   { return <ComingSoon label="Assignments"   /> }
export function Reports()       { return <ComingSoon label="Reports"       /> }
export function Settings()      { return <ComingSoon label="Settings"      /> }
export function Notifications() { return <ComingSoon label="Notifications" /> }

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 border border-dashed border-slate-800 rounded-2xl">
      <div className="text-center">
        <p className="text-slate-400 font-medium">{label}</p>
        <p className="text-xs text-slate-600 mt-1">Work in progress</p>
      </div>
    </div>
  );
}