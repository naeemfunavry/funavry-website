"use client";

import { ChevronDown, ChevronUp, GripVertical, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * An ordered, editable list of child rows — capabilities, bullet points,
 * challenges, address lines.
 *
 * Reordering is up/down buttons rather than drag-and-drop. Drag is nicer with a
 * mouse and considerably worse without one: it is difficult to operate from the
 * keyboard, awkward on a touchscreen, and effectively unusable with a screen
 * reader. Two buttons work everywhere, and for lists this short they are not
 * even slower.
 */
export function RepeatableList<T>({
  items,
  onChange,
  renderItem,
  newItem,
  addLabel = "Add",
  emptyLabel = "Nothing added yet.",
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  newItem: () => T;
  addLabel?: string;
  emptyLabel?: string;
  max?: number;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as T);
    onChange(next);
  };

  const update = (index: number) => (value: T) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="panel-inset px-3 py-4 text-center text-xs text-ink-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="panel-inset flex items-start gap-2 p-2.5">
              <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
                <GripVertical className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                <span className="font-mono text-micro text-ink-400">{index + 1}</span>
              </div>

              <div className="min-w-0 flex-1">{renderItem(item, index, update(index))}</div>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move item ${index + 1} up`}
                  className="btn-ghost btn-sm"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move item ${index + 1} down`}
                  className="btn-ghost btn-sm"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove item ${index + 1}`}
                  className="btn-ghost btn-sm hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        disabled={max !== undefined && items.length >= max}
        className="btn-secondary btn-sm"
      >
        <Plus className="h-3 w-3" />
        {addLabel}
        {max !== undefined && (
          <span className="text-ink-400">
            ({items.length}/{max})
          </span>
        )}
      </button>
    </div>
  );
}
