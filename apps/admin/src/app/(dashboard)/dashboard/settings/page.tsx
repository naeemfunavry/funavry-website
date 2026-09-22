"use client";

import type { Setting } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { describe } from "@/components/resource/resource-table";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { LoadingPanel, Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { relativeTime } from "@/lib/utils";

type ValueType = Setting["valueType"];

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    valueType: "string" as ValueType,
    group: "general",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Setting[]>("/settings"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings"] });

  const saveMutation = useMutation({
    mutationFn: (body: {
      key: string;
      value: string;
      valueType: ValueType;
      group?: string;
      description?: string;
    }) => api.put<Setting>("/settings", body),
    onSuccess: (saved) => {
      toast.success(`Saved ${saved.key}`);
      setDrafts((d) => {
        const next = { ...d };
        delete next[saved.key];
        return next;
      });
      setAdding(false);
      setNewSetting({ key: "", value: "", valueType: "string", group: "general", description: "" });
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => api.delete(`/settings/${key}`),
    onSuccess: () => {
      toast.success("Deleted");
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const grouped = (data ?? []).reduce<Record<string, Setting[]>>((acc, setting) => {
    (acc[setting.group] ??= []).push(setting);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Site-wide key/value configuration. Only settings in the “public” group are served to the website — anything else stays behind authentication."
        actions={
          <button type="button" onClick={() => setAdding((v) => !v)} className="btn-primary">
            <Plus className="h-3.5 w-3.5" />
            New setting
          </button>
        }
      />

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(newSetting);
          }}
          className="panel mb-5 p-4"
        >
          <p className="eyebrow mb-3">New setting</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="s-key" className="field-label">Key</label>
              <input
                id="s-key"
                value={newSetting.key}
                onChange={(e) => setNewSetting((s) => ({ ...s, key: e.target.value }))}
                className="input font-mono"
                placeholder="contact.email"
                pattern="[a-z0-9_.]+"
                title="Lower-case letters, digits, dots and underscores"
                required
              />
            </div>

            <div>
              <label htmlFor="s-group" className="field-label">Group</label>
              <input
                id="s-group"
                value={newSetting.group}
                onChange={(e) => setNewSetting((s) => ({ ...s, group: e.target.value }))}
                className="input"
                placeholder="public"
                required
              />
            </div>

            <div>
              <label htmlFor="s-type" className="field-label">Type</label>
              <select
                id="s-type"
                value={newSetting.valueType}
                onChange={(e) =>
                  setNewSetting((s) => ({ ...s, valueType: e.target.value as ValueType }))
                }
                className="select"
              >
                <option value="string">Text</option>
                <option value="number">Number</option>
                <option value="boolean">True / false</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label htmlFor="s-value" className="field-label">Value</label>
              <input
                id="s-value"
                value={newSetting.value}
                onChange={(e) => setNewSetting((s) => ({ ...s, value: e.target.value }))}
                className="input"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="s-desc" className="field-label">Description</label>
              <input
                id="s-desc"
                value={newSetting.description}
                onChange={(e) => setNewSetting((s) => ({ ...s, description: e.target.value }))}
                className="input"
                placeholder="What this controls, for whoever reads it next"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
              Create
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingPanel />
      ) : !data?.length ? (
        <EmptyState
          title="No settings yet"
          description="Nothing is configured. The site falls back to its built-in defaults."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, settings]) => (
            <section key={group} className="panel overflow-hidden">
              <div className="border-b border-line bg-paper-deep/40 px-4 py-2.5">
                <p className="eyebrow">{group}</p>
              </div>

              <ul className="divide-y divide-line-soft">
                {settings.map((setting) => {
                  const draft = drafts[setting.key];
                  const dirty = draft !== undefined && draft !== setting.value;

                  return (
                    <li key={setting.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[16rem_minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm">{setting.key}</p>
                        {setting.description && (
                          <p className="truncate text-xs text-ink-400">{setting.description}</p>
                        )}
                        <p className="font-mono text-micro uppercase tracking-[0.06em] text-ink-400">
                          {setting.valueType} · saved {relativeTime(setting.updatedAt)}
                        </p>
                      </div>

                      {setting.valueType === "boolean" ? (
                        <select
                          value={draft ?? setting.value}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [setting.key]: e.target.value }))
                          }
                          aria-label={setting.key}
                          className="select"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : setting.valueType === "json" ? (
                        <textarea
                          value={draft ?? setting.value}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [setting.key]: e.target.value }))
                          }
                          aria-label={setting.key}
                          className="textarea font-mono text-xs"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={setting.valueType === "number" ? "number" : "text"}
                          value={draft ?? setting.value}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [setting.key]: e.target.value }))
                          }
                          aria-label={setting.key}
                          className="input"
                        />
                      )}

                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={!dirty || saveMutation.isPending}
                          onClick={() =>
                            saveMutation.mutate({
                              key: setting.key,
                              value: draft ?? setting.value,
                              valueType: setting.valueType,
                              group: setting.group,
                            })
                          }
                          className="btn-primary btn-sm"
                        >
                          {saveMutation.isPending ? <Spinner className="border-paper-white/40 border-t-paper-white" /> : <Save className="h-3.5 w-3.5" />}
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(setting.key)}
                          title="Delete setting"
                          className="btn-ghost btn-sm hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
