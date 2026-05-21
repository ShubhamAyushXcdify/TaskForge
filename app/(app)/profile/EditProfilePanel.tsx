"use client";

import { PasswordInput } from "./ProfileUI";

interface EditPanelProps {
  user: any;
  employeeCode: string;
  editForm: {
    firstName: string;
    lastName: string;
    newPassword: string;
    confirmPassword: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  saving: boolean;
  showPasswords: boolean;
  setShowPasswords: (v: boolean | ((p: boolean) => boolean)) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditProfilePanel({
  user,
  employeeCode,
  editForm,
  setEditForm,
  saving,
  showPasswords,
  setShowPasswords,
  onSave,
  onClose,
}: EditPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      {/* Panel */}
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-teal-700 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-semibold text-lg">Edit Profile</h2>
            <p className="text-teal-200 text-xs mt-0.5">Update your name or password</p>
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Employee Code – read-only */}
          {employeeCode && (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
                Employee Code
              </label>
              <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-sm select-all">
                {employeeCode}
              </div>
            </div>
          )}

          {/* Email – read-only */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed text-sm"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={editForm.firstName}
              onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-slate-50 text-slate-800 text-sm transition"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={editForm.lastName}
              onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-slate-50 text-slate-800 text-sm transition"
            />
          </div>

          {/* Change Password */}
          <div className="border-t border-dashed border-slate-200 pt-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Change Password
              </p>
              <button
                type="button"
                onClick={() => setShowPasswords((p) => !p)}
                className="text-xs text-teal-600 hover:underline"
              >
                {showPasswords ? "Hide" : "Show"} fields
              </button>
            </div>

            {showPasswords && (
              <div className="space-y-4">
                <PasswordInput
                  label="New Password"
                  value={editForm.newPassword}
                  onChange={(v) => setEditForm((p) => ({ ...p, newPassword: v }))}
                  placeholder="Min. 8 characters"
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={editForm.confirmPassword}
                  onChange={(v) => setEditForm((p) => ({ ...p, confirmPassword: v }))}
                  placeholder="Re-enter new password"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t bg-white flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 text-sm font-semibold border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 text-sm font-semibold bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
