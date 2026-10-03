"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Briefcase, ChevronDown, MapPin, Search, X } from "lucide-react";
import Container from "@/components/ui/Container";
import type { Job } from "@/lib/careers";
import { cn } from "@/lib/utils";

const ALL = "All";

/* A fixed locale and zone, so the server and the browser print the same
   date and hydration never disagrees. */
const POSTED = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function countBy(jobs: Job[], key: "department" | "location") {
  const counts = new Map<string, number>();
  for (const j of jobs) counts.set(j[key], (counts.get(j[key]) ?? 0) + 1);
  return Array.from(counts, ([name, count]) => ({ name, count }));
}

/**
 * Find your next opportunity: a search and filter bar over the open roles,
 * with the departments listed down the left from lg. Every filter is live —
 * there is no submit — and applying jumps to the contact form below.
 */
export default function JobBoard({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState(ALL);
  const [location, setLocation] = useState(ALL);

  const departments = useMemo(() => countBy(jobs, "department"), [jobs]);
  const locations = useMemo(() => countBy(jobs, "location"), [jobs]);

  const q = query.trim().toLowerCase();
  const shown = jobs.filter(
    (j) =>
      (department === ALL || j.department === department) &&
      (location === ALL || j.location === location) &&
      (!q ||
        [j.title, j.department, j.location, ...j.skills].some((s) =>
          s.toLowerCase().includes(q),
        )),
  );
  const filtered = q !== "" || department !== ALL || location !== ALL;
  const reset = () => {
    setQuery("");
    setDepartment(ALL);
    setLocation(ALL);
  };

  return (
    <section
      id="open-positions"
      aria-labelledby="careers-roles"
      className="relative scroll-mt-20 overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Open Positions
              </span>
            </div>
            <h2 id="careers-roles" className="mt-6 text-h3 text-ink">
              Find your next <span className="text-azure-ink">opportunity.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
            Work on meaningful projects, grow your skills and be part of a team
            that&apos;s building a better tomorrow.
          </p>
        </div>

        {/* ---- Search and filters ---- */}
        <div className="mt-10 grid gap-3 border border-line bg-paper-white p-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative flex items-center sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search roles</span>
            <Search size={16} aria-hidden className="pointer-events-none absolute left-4 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles or skills — e.g. React, Designer"
              className="h-12 w-full border border-line bg-paper pl-11 pr-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-400 focus:border-azure"
            />
          </label>
          <Select
            label="Department"
            value={department}
            onChange={setDepartment}
            options={departments.map((d) => d.name)}
            allLabel="All departments"
          />
          <Select
            label="Location"
            value={location}
            onChange={setLocation}
            options={locations.map((l) => l.name)}
            allLabel="All locations"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          {/* ---- Departments, from lg ---- */}
          <aside className="hidden self-start border border-line bg-paper-white lg:block">
            <h3 className="border-b border-line px-5 py-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
              Departments
            </h3>
            <ul className="p-2">
              {[{ name: ALL, count: jobs.length }, ...departments].map((d) => {
                const on = d.name === department;
                return (
                  <li key={d.name}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDepartment(d.name)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-[14px] transition-colors duration-300",
                        on
                          ? "bg-[#102e54] font-medium text-paper"
                          : "text-ink-500 hover:bg-paper hover:text-ink",
                      )}
                    >
                      {d.name === ALL ? "All departments" : d.name}
                      <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-amber" : "text-ink-400")}>
                        {d.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ---- The roles ---- */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <p aria-live="polite" className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
                {shown.length} {shown.length === 1 ? "open role" : "open roles"}
              </p>
              {filtered && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-azure-ink hover:text-ink"
                >
                  <X size={12} aria-hidden />
                  Clear filters
                </button>
              )}
            </div>

            {shown.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {shown.map((job) => (
                  <li key={job.id}>
                    <JobRow job={job} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 border border-dashed border-line-strong bg-paper-white px-6 py-12 text-center">
                <p className="text-[17px] font-medium text-ink">No roles match your search.</p>
                <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-[1.65] text-ink-500">
                  Try another keyword or clear the filters — or send us your CV
                  below and we&apos;ll be in touch when something fits.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 border border-line-strong px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function JobRow({ job }: { job: Job }) {
  return (
    <a
      href="#contact"
      className="group relative flex flex-col gap-4 border border-line bg-paper-white p-5 transition-colors duration-300 hover:border-azure sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:p-6"
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-amber transition-transform duration-500 ease-expo group-hover:scale-y-100"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-[17px] font-medium leading-snug tracking-[-0.015em] text-ink lg:text-[18px]">
            {job.title}
          </h3>
          <span className="bg-azure-50 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-azure-ink">
            {job.mode}
          </span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase size={13} aria-hidden className="text-ink-400" />
            {job.department}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} aria-hidden className="text-ink-400" />
            {job.location}
          </span>
          <span>{job.type}</span>
        </p>
        <p className="mt-2.5 max-w-[60ch] text-[14px] leading-[1.6] text-ink-500">{job.summary}</p>
        <ul className="mt-3.5 flex flex-wrap gap-2">
          {job.skills.map((s) => (
            <li
              key={s}
              className="border border-line bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-500"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-none items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
          Posted {POSTED.format(new Date(job.posted))}
        </span>
        <span className="inline-flex items-center gap-2 text-[13.5px] font-medium text-azure-ink">
          Apply now
          <ArrowRight
            size={15}
            aria-hidden
            className="transition-transform duration-300 ease-expo group-hover:translate-x-1"
          />
        </span>
      </div>
    </a>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none border border-line bg-paper pl-4 pr-10 text-[14px] text-ink outline-none transition-colors focus:border-azure"
      >
        <option value={ALL}>{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={15} aria-hidden className="pointer-events-none absolute right-4 text-ink-400" />
    </label>
  );
}
