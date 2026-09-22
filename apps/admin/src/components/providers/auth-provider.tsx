"use client";

import { type AuthSession, type AuthUser, Permission, UserRole } from "@funavry/types";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  api,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
} from "@/lib/api-client";

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the initial silent refresh settles — gates the whole shell. */
  isLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  /** True when the user holds every listed permission. */
  can: (...permissions: Permission[]) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Access tokens last 15 minutes; refreshing at 12 leaves headroom. */
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Restores the session on load.
   *
   * There is no token in storage to read — the access token lives in memory and
   * is gone after a reload. What survives is the httpOnly refresh cookie, so the
   * panel asks the server to mint a new access token from it. That is what makes
   * a hard refresh keep you signed in without ever putting a credential
   * somewhere script can read it.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const restored = await refreshSession();

      if (cancelled) return;

      if (restored) {
        try {
          const me = await api.get<AuthUser>("/auth/me");
          if (!cancelled) setUser(me);
        } catch {
          if (!cancelled) clearSession();
        }
      }

      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  /* A failed refresh anywhere in the app lands here. */
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSession();
      if (pathname !== "/login") router.replace("/login?expired=1");
    });

    return () => setSessionExpiredHandler(null);
  }, [clearSession, pathname, router]);

  /**
   * Refreshes ahead of expiry.
   *
   * Without this the token dies mid-session and the first action after that
   * pays a failed request, a refresh and a replay. Rotating on a timer means the
   * user never notices the token has a lifetime at all.
   */
  useEffect(() => {
    if (!user) return;

    timerRef.current = setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  const signIn = useCallback(
    async (identifier: string, password: string): Promise<AuthUser> => {
      const session = await api.post<AuthSession>("/auth/login", { identifier, password });

      setAccessToken(session.accessToken);
      setUser(session.user);

      return session.user;
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* The cookie is cleared locally regardless — a network failure must not
         leave someone stuck in a session they asked to end. */
    }

    clearSession();
    router.replace("/login");
  }, [clearSession, router]);

  const refresh = useCallback(async () => {
    const me = await api.get<AuthUser>("/auth/me");
    setUser(me);
  }, []);

  /**
   * Every listed permission, not any.
   *
   * This is UI affordance only. Hiding a button the user cannot use is good
   * manners; the API enforces the same rules again on every request, because a
   * hidden button is not a permission check.
   */
  const can = useCallback(
    (...permissions: Permission[]): boolean => {
      if (!user) return false;
      if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => Boolean(user && roles.some((r) => user.roles.includes(r))),
    [user],
  );

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut, can, hasRole, refresh }),
    [user, isLoading, signIn, signOut, can, hasRole, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
