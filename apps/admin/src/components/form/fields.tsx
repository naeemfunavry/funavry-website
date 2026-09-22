"use client";

import { ContentStatus } from "@funavry/types";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function FieldShell({
  label,
  name,
  hint,
  error,
  required,
  className,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>

      {children}

      {/* The error replaces the hint rather than stacking under it — two lines
          of small grey text with one of them red is harder to scan than one. */}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs leading-relaxed text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  mono,
  ...props
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  mono?: boolean;
}) {
  return (
    <FieldShell {...props}>
      <input
        id={props.name}
        name={props.name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={props.required}
        aria-invalid={Boolean(props.error)}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
        className={cn("input", mono && "font-mono", props.error && "input-error")}
      />
    </FieldShell>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  ...props
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <FieldShell {...props}>
      <textarea
        id={props.name}
        name={props.name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={props.required}
        aria-invalid={Boolean(props.error)}
        className={cn("textarea", props.error && "input-error")}
      />

      {maxLength && (
        <p
          className={cn(
            "mt-1 text-right font-mono text-micro",
            value.length > maxLength * 0.9 ? "text-amber-ink" : "text-ink-400",
          )}
        >
          {value.length} / {maxLength}
        </p>
      )}
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ...props
}: BaseFieldProps & {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <FieldShell {...props}>
      <select
        id={props.name}
        name={props.name}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-invalid={Boolean(props.error)}
        className={cn("select", props.error && "input-error")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  checked,
  onChange,
  label,
  name,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 border-line-strong text-ink accent-ink"
      />
      <div>
        <label htmlFor={name} className="text-sm">
          {label}
        </label>
        {hint && <p className="text-xs leading-relaxed text-ink-400">{hint}</p>}
      </div>
    </div>
  );
}

export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: ContentStatus.DRAFT, label: "Draft — not on the site" },
  { value: ContentStatus.PUBLISHED, label: "Published — live on funavry.com" },
  { value: ContentStatus.ARCHIVED, label: "Archived — kept, not shown" },
];

/** A titled group of fields, so a long form reads as sections rather than a wall. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="border-b border-line px-5 py-3">
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-400">{description}</p>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
