"use client";

import { type AuthUser, UserRole } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LockOpen, LogOut, Plus, ShieldCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { describe } from "@/components/resource/resource-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingPanel, Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { cn, formatDateTime, initialsOf, relativeTime } from "@/lib/utils";

export default function UsersPage() {
  const { user: me, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const isSuperAdmin = hasRole(UserRole.SUPER_ADMIN);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    roles: [UserRole.EDITOR] as UserRole[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.list<AuthUser>("/users", { limit: 50 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post<AuthUser>("/users", body),
    onSuccess: (created) => {
      toast.success(`Created ${created.username}`, {
        description: "They must change this password the first time they sign in.",
      });
      setCreating(false);
      setForm({ username: "", email: "", fullName: "", password: "", roles: [UserRole.EDITOR] });
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const disableMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}`, { isActive }),
    onSuccess: (_r, variables) => {
      toast.success(variables.isActive ? "Account enabled" : "Account disabled and signed out");
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/unlock`),
    onSuccess: () => {
      toast.success("Lockout cleared");
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/revoke-sessions`),
    onSuccess: () => toast.success("All sessions revoked"),
    onError: (err: unknown) => toast.error(describe(err)),
  });

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Users"
        description="Admin accounts and their roles. Disabling an account revokes its sessions immediately rather than waiting for its token to expire."
        actions={
          isSuperAdmin ? (
            <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary">
              <Plus className="h-3.5 w-3.5" />
              New user
            </button>
          ) : null
        }
      />

      {creating && isSuperAdmin && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="panel mb-5 p-4"
        >
          <p className="eyebrow mb-3">New account</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="new-username" className="field-label">Username</label>
              <input
                id="new-username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="input"
                required
                minLength={3}
                pattern="[a-z0-9._\-]+"
                title="Lower-case letters, digits, dots, underscores and hyphens"
              />
            </div>

            <div>
              <label htmlFor="new-email" className="field-label">Email</label>
              <input
                id="new-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="new-fullname" className="field-label">Full name</label>
              <input
                id="new-fullname"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="input"
                required
                minLength={2}
              />
            </div>

            <div>
              <label htmlFor="new-role" className="field-label">Role</label>
              <select
                id="new-role"
                value={form.roles[0]}
                onChange={(e) => setForm((f) => ({ ...f, roles: [e.target.value as UserRole] }))}
                className="select"
              >
                <option value={UserRole.EDITOR}>Editor — write and edit, cannot publish</option>
                <option value={UserRole.ADMIN}>Admin — full content and settings</option>
                <option value={UserRole.SUPER_ADMIN}>Super admin — everything, including accounts</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="new-password" className="field-label">
                Initial password — at least 12 characters, with upper, lower and a digit
              </label>
              <input
                id="new-password"
                type="text"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input font-mono"
                required
                minLength={12}
              />
              <p className="mt-1 text-xs text-ink-400">
                A handover credential — they are forced to replace it on first sign-in.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Spinner className="border-paper-white/40 border-t-paper-white" /> : null}
              Create account
            </button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingPanel />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse">
              <thead>
                <tr>
                  <th className="table-head">Account</th>
                  <th className="table-head w-36">Roles</th>
                  <th className="table-head w-24">Status</th>
                  <th className="table-head w-36">Last sign-in</th>
                  <th className="table-head w-32 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>

              <tbody>
                {data?.items.map((account) => {
                  const isMe = account.id === me?.id;

                  return (
                    <tr key={account.id} className={cn("table-row", !account.isActive && "opacity-60")}>
                      <td className="table-cell">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-ink font-mono text-micro text-paper-white">
                            {initialsOf(account.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {account.username}
                              {isMe && <span className="ml-2 text-xs text-ink-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-ink-400">{account.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="table-cell">
                        <span className="badge-neutral">
                          <ShieldCheck className="h-3 w-3" />
                          {account.roles.join(", ")}
                        </span>
                      </td>

                      <td className="table-cell">
                        {!account.isActive ? (
                          <span className="badge-archived">Disabled</span>
                        ) : account.mustChangePassword ? (
                          <span className="badge-draft">Must reset</span>
                        ) : (
                          <span className="badge-published">Active</span>
                        )}
                      </td>

                      <td className="table-cell text-xs text-ink-400">
                        {account.lastLoginAt ? (
                          <span title={formatDateTime(account.lastLoginAt)}>
                            {relativeTime(account.lastLoginAt)}
                          </span>
                        ) : (
                          "Never"
                        )}
                      </td>

                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => unlockMutation.mutate(account.id)}
                            title="Clear lockout"
                            className="btn-ghost btn-sm"
                          >
                            <LockOpen className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => revokeMutation.mutate(account.id)}
                            title="Sign out of every device"
                            className="btn-ghost btn-sm"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                          </button>

                          {/* Disabling yourself is refused by the API; hiding the
                              button avoids offering an action that cannot work. */}
                          {!isMe && (
                            <button
                              type="button"
                              onClick={() =>
                                disableMutation.mutate({
                                  id: account.id,
                                  isActive: !account.isActive,
                                })
                              }
                              title={account.isActive ? "Disable account" : "Enable account"}
                              className={cn("btn-sm", account.isActive ? "btn-ghost hover:text-danger" : "btn-ghost")}
                            >
                              {account.isActive ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <KeyRound className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
