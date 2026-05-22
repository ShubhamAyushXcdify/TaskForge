"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { safeJsonParse } from "./profileUtils";
import { useSession } from "next-auth/react";
import { apiFetch } from "./api";

interface EditForm {
  firstName: string;
  lastName: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseEditProfileOptions {
  fullName: string;
  token: string | undefined;
  backendUrl: string;
}

export function useEditProfile({ fullName, token, backendUrl }: UseEditProfileOptions) {
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const { update } = useSession();

  const [editForm, setEditForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
  });


  useEffect(() => {
    if (!fullName || fullName === "User") return;
    const parts = fullName.split(" ");
    setEditForm((prev) => ({
      ...prev,
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") ?? "",
    }));
  }, [fullName]);

  const handleSaveProfile = useCallback(async () => {
    const trimmedFirst = editForm.firstName.trim();
    const trimmedLast = editForm.lastName.trim();
    const passwordChanged = editForm.newPassword.length > 0;

    const originalParts = fullName.split(" ");
    const originalFirst = originalParts[0] ?? "";
    const originalLast = originalParts.slice(1).join(" ") ?? "";

    const nameChanged =
      trimmedFirst !== originalFirst || trimmedLast !== originalLast;

    if (!nameChanged && !passwordChanged) {
      toast.info("No changes to save");
      return;
    }

    if (passwordChanged) {
      if (editForm.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      
      const payload: Record<string, string> = {};
      if (nameChanged) {
        payload.firstName = trimmedFirst;
        payload.lastName = trimmedLast;
      }
      if (passwordChanged) {
        payload.password = editForm.newPassword; 
      }

 const res = await apiFetch(`${backendUrl}/api/Employee/me`, token, {
  method: "PATCH",
  body: JSON.stringify(payload),
});
if (!res) return;

      const data = await safeJsonParse(res);

      if (res.ok && data?.success !== false) {
        toast.success("Profile updated successfully!");
            await update({
      firstName: trimmedFirst,
      lastName: trimmedLast,
    });

        setEditOpen(false);
        setEditForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        toast.error(data?.message || `Update failed (${res.status})`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [editForm, fullName, token, backendUrl]);

  return {
    editOpen,
    setEditOpen,
    saving,
    editForm,
    setEditForm,
    showPasswords,
    setShowPasswords,
    handleSaveProfile,
  };
}
