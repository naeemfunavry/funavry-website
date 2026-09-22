# Security

What is in place, and why each control is there rather than the obvious
alternative. Written so the next person can tell which lines are load-bearing.

---

## Authentication

**Argon2id**, at the OWASP floor: 19 MiB memory, 2 iterations, 1 thread.
Chosen over bcrypt because it is memory-hard — bcrypt's cost is CPU-only, which
GPU and ASIC cracking rigs parallelise cheaply. The `id` variant specifically:
Argon2i resists side channels but is weaker against time-memory trade-offs,
Argon2d is the reverse, and `id` is the hybrid correct for password storage.

The stored hash is `select: false`, so it cannot reach a response by someone
returning a user entity. On sign-in, a hash produced with weaker parameters is
transparently upgraded while the plaintext is legitimately in hand.

**No user enumeration.** "No such account", "wrong password" and "account
disabled" all return the same `INVALID_CREDENTIALS`. The no-such-user path also
burns a real Argon2 hash first, because a missing account otherwise answers
measurably faster and that timing difference is a reliable oracle no matter how
carefully the message is worded. The specific reason *is* recorded — in the
audit table, where it belongs.

**Lockout** after 5 failed attempts, for 15 minutes, checked *before* the
password so a locked account cannot be used as a slow oracle. Login attempts
live in their own table so the check is a narrow indexed count rather than a
scan of everything that has ever happened.

**Rate limiting** on the credential endpoints is keyed on IP *and* submitted
identifier. IP alone lets one attacker behind a NAT lock out an office;
identifier alone lets a botnet spread an attack across addresses. The pair
throttles attempts against one account while leaving other users on that address
alone.

## Sessions

A short access JWT (15 minutes) and an opaque refresh token (7 days).

The access token is returned in the body; the refresh token is set as an
**httpOnly, Secure, SameSite=Strict cookie**. That split is the point: script on
the page can hold the access token, but an XSS payload cannot read the
long-lived credential, because the browser will not show it to JavaScript at
all. `SameSite=Strict` is what makes CSRF against the refresh endpoint
impossible rather than merely inconvenient.

Refresh tokens are stored as a **SHA-256**, so a dump of the table is not a set
of usable sessions. Plain SHA-256 rather than a KDF is correct here: the input
is 256 bits of server-generated randomness, so there is no dictionary to slow
down.

**Rotation with reuse detection.** Each refresh issues a successor and marks its
predecessor replaced. An already-rotated token being presented again means the
value was captured — from a log, a proxy, a stolen backup — so the entire
session chain is revoked and the event audited. The attacker and the legitimate
user are both signed out, which is the correct outcome when you cannot tell
which one is calling.

`tokenVersion` is bumped on a password change, so access tokens already in
circulation are refused on their next use rather than staying valid for up to
fifteen more minutes after someone changed their password *because* they thought
it was compromised.

JWTs verify `issuer` and `audience`, not just the signature, and pin `HS256` —
without the algorithm pinned, `alg: none` and RS256-public-key-as-HMAC-secret
are both live verification bypasses.

## Authorization

Roles are a join table; permissions hang off roles. Both are loaded **from the
database on every request**, not read from a claim in the token. That costs a
lookup and buys revocation: demote or disable someone and their next call is
refused, rather than at whatever point their token happens to expire.

`SUPER_ADMIN` bypasses the permission matrix by design — it is the role that
must always be able to repair a misconfigured one.

Authentication is the default: the JWT guard is global, so a route is protected
unless it carries `@Public()`. That ordering matters. Forgetting the decorator
makes a route inaccessible, which someone notices immediately; an opt-in scheme
fails the other way.

The admin panel hides controls the user cannot use, but that is manners, not
access control — the API enforces the same rules again on every request.

## Input

`whitelist` + `forbidNonWhitelisted` on the global validation pipe. Together
they close mass assignment: without them a POST carrying `"role":
"SUPER_ADMIN"` or `"id": "…"` reaches the entity and TypeORM writes it. Verified
— an undeclared property is a 400 naming the field, not a silent strip.

Implicit type conversion is **off**. It coerces in surprising directions —
`"0"` to `false`, an array to a string — so DTOs declare their transforms.

Page size is capped, not merely defaulted: an uncapped `limit` is a cheap denial
of service. Free-text search is bound as a parameter and its LIKE
metacharacters are escaped, so a `%` is a literal percent sign rather than a
full scan.

`sortBy` is checked against a per-resource allow-list. TypeORM interpolates the
ORDER BY column rather than binding it, so an unchecked value there is a
straightforward SQL injection. The one place table and column names are
interpolated at all — the media reference counter — builds them from a literal
list in the source, never from a request.

## Uploads

Order matters, and each step exists for a reason:

1. Size is rejected first, because it is free. Multer's own limit aborts the
   stream as it arrives, so an oversized body is never fully buffered.
2. The declared `Content-Type` is **discarded** and the real type read from the
   file's magic bytes. A `.png`-named PHP script will happily claim
   `image/png`. Verified — such a file is refused.
3. Raster images are **re-encoded** rather than stored as received. This is what
   neutralises a polyglot file that is both a valid PNG and a valid script:
   re-encoding keeps the pixels and discards everything else, including EXIF,
   which routinely carries the GPS coordinates of wherever a photo was taken.
   Verified — EXIF present in, absent out.
4. `limitInputPixels` caps the decoded dimensions. A decompression bomb is a
   small file that expands to a 50,000 × 50,000 image; without a cap, decoding
   it exhausts the heap — denial of service from a 2 KB upload.
5. SVGs are sanitised. An SVG is a document, not a picture: it can carry
   `<script>`, event handlers, `<foreignObject>` and external references. Served
   from the panel's own origin, a hostile one is stored XSS with a session token
   in reach. Verified — script, `onload` and a `javascript:` href are all
   stripped, the artwork preserved.

Storage keys are server-generated and random; the client's filename is kept for
display only and never touches the filesystem. The local driver resolves every
path and refuses anything outside the upload root, at the layer that actually
touches disk. Files are written `0o640` — the usual default is world-readable.
Uploads are served with `nosniff` and a sandboxing CSP.

## Errors and logging

One global exception filter is the only exit point for failures. It is where
internal detail stops: a `QueryFailedError` carries the failing SQL and often
the parameter values, and letting that reach a browser hands over the schema.
The driver error is logged in full; the client is told only which of a handful
of situations it hit. A duplicate-key violation is distinguished — it is a
client mistake, not a server fault — without echoing the column name.

Logs **redact** by key name, not by an allow-list of known-secret fields, so a
credential in a field nobody thought about is still caught. Request serialisers
log only the headers worth having, because logging them all reinstates exactly
what redaction removed as soon as a new secret-bearing header appears.

Audit diffs pass through a second, independent redaction before they are stored,
because that row is durable and a missed key would be permanent.

## Audit trail

Append-only. It does **not** extend the base entity: no `deletedAt`, because a
soft-deletable audit log is not an audit log, and no `updatedAt`, because a row
that can be amended proves nothing. There is no endpoint that edits or deletes
one.

Every authentication event and every write is recorded with the actor, the
client IP, a coarse device label, the correlation id, timing and a redacted
field-level diff. Failures are recorded too — a refused delete is more
interesting than a successful one if someone is probing what they can remove.

Actor and resource labels are snapshotted as text rather than joined. A foreign
key would either block deleting the user it points at or cascade the history
away with them, and renaming a case study would silently rewrite what the log
says happened.

The client IP comes from Express's `req.ip` resolved against a configured
`trust proxy` **hop count**, never a hand-parse of `X-Forwarded-For` and never
`trust proxy: true`. Both of those accept the left-most entry, which is entirely
client-supplied — so any caller could claim any address and walk past both the
rate limiter and the audit log's IP column.

## Transport and headers

Helmet supplies HSTS, `nosniff`, `frameguard: deny`, a strict referrer policy
and a locked-down CSP. `x-powered-by` is disabled — there is no reason to tell a
scanner what it is talking to.

CORS uses an exact origin allow-list with `credentials: true`. The two interlock:
a browser refuses `Access-Control-Allow-Origin: *` on a credentialed request, so
a wildcard would not merely be lax — it would break the login flow while
appearing to work in tools that ignore CORS.

JSON bodies are capped at 1 MB. Requests time out at 30 seconds, because a query
that never returns holds its socket and enough of them exhaust the pool.

## Revalidation endpoint

The one route that an unauthenticated caller can make do work, so it is narrow:
a shared secret compared in **constant time** (a plain `===` leaks length and,
in principle, content through timing), carried in a header rather than a query
string (query strings reach access logs, browser history and referrer headers),
with tags and paths checked against fixed allow-lists so a leaked secret cannot
purge arbitrary routes. It refuses to run at all if the secret is unconfigured,
rather than defaulting to open. Failures return no detail.

## Configuration

The environment is validated at boot and the app refuses to start on a missing
or weak secret — a JWT secret silently defaulting to `"secret"` is the classic
version of this bug. Production additionally refuses to start if
`synchronize` is on, cookies are not `Secure`, CORS contains a wildcard or
localhost, the two JWT secrets match, or the seeded admin password is short.

---

## Known limitations

- **The seeded password.** `admin1234` was specified for this build. It is
  hashed, and the account is flagged to force a change on first sign-in, but it
  is weak and it is in `.env.example`. Change it before this is reachable from
  anywhere but localhost. The env validator enforces a 16-character minimum in
  production.
- **Post bodies are stored as given.** An editor with `content:create` can put
  markup in a post body. Whatever renders it must treat it as untrusted;
  sanitising on read is the only place that can be enforced for content already
  in the database.
- **No 2FA.** Worth adding for an account that can publish to a public site.
- **Audit retention is unbounded.** The table grows forever. Pruning is a
  database-level job and has not been set up.
- **No CSRF token on state-changing requests.** `SameSite=Strict` on the refresh
  cookie plus bearer-token authentication for writes covers the usual vectors,
  since a cross-site request cannot attach the Authorization header. A
  double-submit token would still be defence in depth.
