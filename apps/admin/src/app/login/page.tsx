"use client";

import { ApiErrorCode } from "@funavry/types";
import { AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api-client";

function LoginForm() {
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const expired = params.get("expired") === "1";

  /* Already signed in — bounce straight through rather than showing a form
     that would immediately succeed. */
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const signedIn = await signIn(identifier, password);

      /* The seeded master account, and any account an admin created, arrives
         with a handover password it has to replace before doing anything. */
      router.replace(signedIn.mustChangePassword ? "/account/password?forced=1" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        /* The server deliberately gives one message for "no such user" and
           "wrong password", and that is repeated verbatim here — softening it
           into something more helpful would rebuild the enumeration oracle the
           server went to the trouble of closing. */
        setError(
          err.code === ApiErrorCode.RATE_LIMITED
            ? "Too many attempts. Wait a minute and try again."
            : err.message,
        );
      } else {
        setError("Could not reach the server. Check that the API is running.");
      }
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper-deep px-4">
      <div aria-hidden className="grid-paper absolute inset-0 opacity-60" />

      {/* A wash of the brand gradient, the same one the site's hero carries. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #449ED8 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #F59F13 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-[26rem]">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="h-9 w-auto" />
          <div>
            <p className="text-lg font-semibold leading-none tracking-tight">Funavry</p>
            <p className="eyebrow mt-1">Content Management</p>
          </div>
        </div>

        <div className="panel shadow-panel">
          <div className="border-b border-line px-6 py-4">
            <h1 className="text-base font-semibold tracking-tight">Sign in</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Authorised administrators only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6" noValidate>
            {expired && !error && (
              <p
                role="status"
                className="flex items-start gap-2 border border-amber/40 bg-amber-50 px-3 py-2 text-sm text-amber-ink"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Your session expired. Sign in again to continue.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 border border-danger/30 bg-danger-50 px-3 py-2 text-sm text-danger-ink"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <div>
              <label htmlFor="identifier" className="field-label">
                Username or email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !identifier || !password}
              className="btn-primary w-full"
            >
              {submitting ? (
                <>
                  <Spinner className="border-paper-white/40 border-t-paper-white" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-start gap-2 border-t border-line bg-paper-deep/50 px-6 py-3">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
            <p className="text-xs leading-relaxed text-ink-400">
              Sign-in attempts are recorded with the originating IP address.
              Repeated failures lock the account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* useSearchParams needs a Suspense boundary for the static shell to prerender. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper-deep">
          <Spinner className="h-6 w-6" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
