"use client";

export default function ConfirmDeleteModal({
  label,
  onConfirm,
  onCancel,
  loading,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/40 text-red-400 flex items-center justify-center text-lg shrink-0">⚠</div>
          <div>
            <p className="text-sm font-semibold text-white">Delete "{label}"?</p>
            <p className="text-[11px] text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}