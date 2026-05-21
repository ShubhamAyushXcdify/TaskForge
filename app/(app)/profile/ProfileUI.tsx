"use client";

import { useState } from "react";

// ─── StatRow ──────────────────────────────────────────────────────────────────

export function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600 text-sm">{label}</span>
      <span className="font-bold text-lg text-slate-800">{value}</span>
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-slate-50 text-slate-800 text-sm transition"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          tabIndex={-1}
        >
          {show ? (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── SkillBar ─────────────────────────────────────────────────────────────────

export function SkillBar({
  category,
  completed,
  total,
  progress,
}: {
  category: string;
  completed: number;
  total: number;
  progress: number;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-slate-700 truncate max-w-[65%]">{category}</span>
        <span className="text-teal-600 text-xs font-medium">
          {completed}/{total}
        </span>
      </div>
      <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── CourseUploadButton ───────────────────────────────────────────────────────

export function CourseUploadButton({
  assignmentId,
  uploadingId,
  onUpload,
  variant = "teal",
}: {
  assignmentId: string;
  uploadingId: string | null;
  onUpload: (id: string) => void;
  variant?: "teal" | "amber";
}) {
  const isUploading = uploadingId === assignmentId;
  const colors =
    variant === "amber"
      ? isUploading
        ? "bg-amber-400 cursor-wait"
        : "bg-amber-500 hover:bg-amber-600"
      : isUploading
      ? "bg-teal-400 cursor-wait"
      : "bg-teal-600 hover:bg-teal-700";

  return (
    <button
      onClick={() => onUpload(assignmentId)}
      disabled={isUploading}
      title="Upload Certificate"
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 text-white shrink-0 ${colors}`}
    >
      {isUploading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
