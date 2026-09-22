# Funavry

The funavry.com website, its content API, and the admin panel that edits it.

```
funavry-website/
├── apps/
│   ├── web/     Next.js  — the public site           :3000
│   ├── admin/   Next.js  — the CMS admin panel       :3001
│   └── api/     NestJS   — content API + MySQL       :4000
└── packages/
    └── types/   The response contract all three compile against
```

The site's content used to live in TypeScript files. It lives in MySQL now:
editors change it in the admin panel, the API asks the site to re-render, and
the change is live without a deploy.

---

## Getting started

### 1. Database

MySQL 8. Create the schema and a least-privilege application user:

```sql
CREATE DATABASE funavry_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Both hosts: MySQL reverse-resolves a TCP connection from 127.0.0.1 to
-- 'localhost' unless skip-name-resolve is set, so granting one is a coin flip.
CREATE USER 'funavry_app'@'localhost'  IDENTIFIED BY 'a-strong-password';
CREATE USER 'funavry_app'@'127.0.0.1'  IDENTIFIED BY 'a-strong-password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON funavry_cms.* TO 'funavry_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON funavry_cms.* TO 'funavry_app'@'127.0.0.1';
```

No `DROP`, no `GRANT OPTION`: the application shapes its own tables through
migrations but cannot destroy the schema or escalate its own privileges.

### 2. Configure

```bash
npm install

cp apps/api/.env.example   apps/api/.env
cp apps/web/.env.example   apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Fill in `apps/api/.env`. Generate each secret separately:

```bash
openssl rand -base64 48   # JWT_ACCESS_SECRET
openssl rand -base64 48   # JWT_REFRESH_SECRET   (must differ from the access one)
openssl rand -base64 48   # COOKIE_SECRET
openssl rand -base64 32   # REVALIDATE_SECRET
```

`REVALIDATE_SECRET` must be identical in `apps/api/.env` and
`apps/web/.env.local` — it is how the site knows a re-render request really came
from the CMS.

The API validates its whole environment at boot and refuses to start on a
missing or weak secret, rather than falling back to a default.

### 3. Migrate and seed

```bash
npm run migration:run   # 36 tables
npm run seed            # roles, the master admin, and the existing site content
```

The seed imports what the website already published — 34 case studies, 16
services, 10 industries, the offices, the leadership cards, 37 client marks and
92 images — so the site looks identical the moment it starts reading from the
database. It is idempotent; running it twice changes nothing.

### 4. Run

```bash
npm run dev:api     # :4000  — docs at /api/v1/docs in development
npm run dev:admin   # :3001
npm run dev:web     # :3000
```

Sign in at <http://localhost:3001> with the seeded credentials from
`SEED_ADMIN_*`. The account is flagged to force a password change on first
sign-in — the seeded password is a handover credential, not a permanent one.

---

## How a change reaches the site

1. An editor saves in the admin panel.
2. The API writes the row, records an audit entry, and `POST`s the affected
   cache tags to the site's `/api/revalidate`.
3. Next purges those tags. The next request re-renders from the API.

Tags describe data, not routes, so the API never has to know which pages exist.
Editing one case study invalidates `case-studies`, which re-renders the home
deck, the work index, that study's own page and every industry and service page
that lists it.

If a revalidation is ever lost — the site was mid-deploy, the network blipped —
every page also carries a one-hour revalidate, so the worst case is an hour
stale rather than stale until the next deploy.

---

## Layout

### `apps/api`

```
src/
├── common/       Cross-cutting: the exception filter, response envelope,
│                 guards, the audit interceptor, the shared CRUD base classes
├── config/       Environment validation, typed config, logging
├── database/     Entities, migrations, seeds
└── modules/      One per resource
```

Four things are registered globally, which is why they are consistent rather
than per-controller: every response is enveloped, every failure is caught and
sanitised, every route is authenticated unless it carries `@Public()`, and every
request is rate limited.

### `apps/web`

Server components fetch from the API and pass data to the client sections. The
sections animate and hold scroll state, so they cannot fetch; they no longer
import content either.

`src/lib/case-studies.ts` and `src/lib/case-study-details.ts` still exist, but
only as type definitions. **Editing content there changes nothing.** The data
lives in the CMS.

### `apps/admin`

Uses the site's own design tokens — the same paper, ink and brand accents — so
the panel reads as part of Funavry rather than a bolted-on tool.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev:web` / `dev:admin` / `dev:api` | Run one app |
| `npm run build` | Build everything |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Roll the last one back |
| `npm run seed` | Seed roles, the master admin and content |
| `npm run migration:generate -w @funavry/api -- src/database/migrations/Name` | Generate a migration from entity changes |

`synchronize` is off and stays off. TypeORM applies a column rename as a drop
and a create, which on a production table is silent data loss — schema changes
go through a migration file that can be read before it runs.

---

## Security

Documented in `docs/SECURITY.md`. In short: Argon2id password hashing, short
access tokens with rotating refresh tokens in httpOnly cookies, reuse detection,
per-account lockout, role and permission guards checked against the database on
every request, strict input validation with mass-assignment blocking, uploads
verified by magic bytes and re-encoded, and an append-only audit trail recording
who did what from which IP address.

## Moving media to S3

Uploads are on local disk. Everything depends on `StorageDriverPort`, so the
move is one provider binding: implement `S3Driver`, install
`@aws-sdk/client-s3`, set `STORAGE_DRIVER=S3` and fill in the `S3_*` variables.
Nothing else changes.
