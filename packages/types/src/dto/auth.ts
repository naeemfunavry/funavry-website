import type { Permission, UserRole } from "../enums";

/** The authenticated user, as the admin panel holds it. Never carries a hash. */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  roles: UserRole[];
  /** Flattened union of every permission the user's roles grant. */
  permissions: Permission[];
  avatarUrl: string | null;
  isActive: boolean;
  /** True for the seeded master account until its password is changed. */
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/**
 * What a successful login returns.
 *
 * The access token is in the body because the admin panel sends it as a bearer
 * header. The refresh token is NOT here — it is set as an httpOnly, SameSite
 * cookie the browser cannot read, which is what keeps a stolen XSS payload
 * from walking away with long-lived credentials.
 */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  tokenType: "Bearer";
}

/** The verified JWT payload. Mirrors what the strategy puts on the request. */
export interface JwtPayload {
  /** User id. */
  sub: string;
  email: string;
  roles: UserRole[];
  /** Session id, so a single device can be revoked without a global logout. */
  sid: string;
  /** Issued-at and expiry, seconds since epoch. */
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface LoginRequest {
  /** Accepts either the username or the email address. */
  identifier: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
