"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { describe } from "@/components/resource/resource-table";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";

function ChangePasswordForm() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const forced = params.get("forced") === "1" || user?.mustChangePassword;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: async () => {
      /* The API revokes every session on a password change, including this one.
         Signing out explicitly is the honest response — the alternative is a
         panel that looks signed in until the next request fails. */
      toast.success("Password changed", {
        description: "All sessions were signed out. Sign in again with the new password.",
      });
      await signOut();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const tooShort = newPassword.length > 0 && newPassword.length < 12;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (mismatch || tooShort) return;
    mutation.mutate();
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow="Account"
        title="Change password"
        description="Changing your password signs out every device, including this one."
      />

      {forced && (
        <p className="mb-5 flex items-start gap-2 border border-amber/40 bg-amber-50 px-3 py-2.5 text-sm text-amber-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          This account still has the password it was created with. Choose your own
          before using the panel.
        </p>
      )}

      <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
        <div>
          <label htmlFor="current" className="field-label">
            Current password
          </label>
          <input
            id="current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="next" className="field-label">
            New password
          </label>
          <input
            id="next"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`input ${tooShort ? "input-error" : ""}`}
            required
            minLength={12}
          />
          <p className={`mt-1 text-xs ${tooShort ? "text-danger" : "text-ink-400"}`}>
            At least 12 characters, with an upper-case letter, a lower-case letter and a digit.
            Length matters more than symbols — a long passphrase beats a short cryptic one.
          </p>
        </div>

        <div>
          <label htmlFor="confirm" className="field-label">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`input ${mismatch ? "input-error" : ""}`}
            required
          />
          {mismatch && <p className="mt-1 text-xs text-danger">The two passwords do not match.</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending || mismatch || tooShort || !currentPassword}
            className="btn-primary"
          >
            {mutation.isPending ? (
              <Spinner className="border-paper-white/40 border-t-paper-white" />
            ) : (
              <KeyRound className="h-3.5 w-3.5" />
            )}
            Change password
          </button>

          {!forced && (
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ChangePasswordForm />
    </Suspense>
  );
}
