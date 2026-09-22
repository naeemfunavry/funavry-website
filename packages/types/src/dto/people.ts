import type { ContentLifecycle, MediaRef } from "./common";

/**
 * A bullet on a leadership card, ordered. A row rather than a JSON array so the
 * admin can reorder a single point without rewriting the whole card.
 */
export interface LeaderPoint {
  id: string;
  text: string;
  position: number;
}

/**
 * Leadership — founder, co-founders and the C-suite. `isFounder` and
 * `isCoFounder` are flags rather than a role string because the role line is
 * free text ("Founder & CEO", "Chief GBS Officer") and the site needs to pick
 * the founders out of the set without string-matching that prose.
 */
export interface Leader extends ContentLifecycle {
  id: string;
  slug: string;
  name: string;
  /** The title as printed, e.g. "Founder & CEO". */
  role: string;
  /** Fallback monogram shown until a portrait is supplied. */
  initials: string;
  photo: MediaRef | null;
  bio: string | null;
  email: string | null;
  linkedinUrl: string | null;
  isFounder: boolean;
  isCoFounder: boolean;
  position: number;
  points: LeaderPoint[];
}

/** Wider team directory — everyone who is not on a leadership card. */
export interface TeamMember extends ContentLifecycle {
  id: string;
  slug: string;
  name: string;
  role: string;
  department: string | null;
  /** City of the office they sit in; null for fully remote. */
  location: string | null;
  initials: string;
  photo: MediaRef | null;
  bio: string | null;
  linkedinUrl: string | null;
  position: number;
  officeId: string | null;
}

/**
 * A client testimonial. `pending` carries the approval state: an unapproved
 * quote renders with the "Placeholder" badge the design already has, so demo
 * copy can never be mistaken for an endorsement.
 */
export interface Testimonial extends ContentLifecycle {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: MediaRef | null;
  /** True until the wording is written-approved by the client. */
  pending: boolean;
  position: number;
}
