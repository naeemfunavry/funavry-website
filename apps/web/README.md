# Funavry Website: How to Run Everything

This guide walks you through starting the Funavry website on your own computer,
step by step. It assumes no prior knowledge. If a word is unfamiliar, see the
[Glossary](#glossary) at the bottom.

> For the technical details (how the code is organised, security, how
> publishing works), see the main [`README.md`](../../README.md) at the root of
> the project.

---

## What are the three parts?

The project is made of **three separate programs** that work together. Think of
it like a restaurant:

| Part | Folder | What it is | Restaurant comparison | Address once running |
| --- | --- | --- | --- | --- |
| **Frontend** (the website) | `apps/web` | The public website visitors see | The dining room | <http://localhost:3000> |
| **Backend** (the API) | `apps/api` | The program that stores and serves all the content (case studies, services, team, etc.) | The kitchen | <http://localhost:4000> |
| **CMS** (the admin panel) | `apps/admin` | A private dashboard where staff log in to edit the website's content | The manager's office | <http://localhost:3001> |

There is also a **database** (MySQL). This is where the content is actually
saved. You could call it the pantry. The backend is the only part that talks to
it directly.

**How they connect:**

```
  You edit something in the CMS (admin panel)
            │
            ▼
  The backend saves it in the database
            │
            ▼
  The backend tells the website "this changed, refresh it"
            │
            ▼
  Visitors see the new content on the website
```

---

## Step 0: Install the tools you need (one time only)

You need these installed on your computer before anything else. You only do
this once.

### 1. Node.js (version 20.11 or newer)

Node.js is what runs all three programs.

- Download it from <https://nodejs.org> (pick the **LTS** version).
- To check that it worked, open a terminal and type:

  ```bash
  node -v
  ```

  You should see something like `v20.11.0` or higher. `npm`, the tool that
  installs code packages, comes with Node automatically.

### 2. MySQL (version 8)

MySQL is the database that stores all the content.

- **Ubuntu/Linux:** `sudo apt install mysql-server`
- **Mac:** `brew install mysql`, then `brew services start mysql`
- **Windows:** download "MySQL Installer" from <https://dev.mysql.com/downloads/>

To check that it worked:

```bash
mysql --version
```

### 3. OpenSSL (for making secret passwords)

This is usually already installed on Mac and Linux. To check, type
`openssl version`. On Windows, Git Bash includes it.

### What is a "terminal"?

A terminal is a window where you type commands instead of clicking.

- **Mac:** open the app called *Terminal*.
- **Linux:** press `Ctrl + Alt + T`.
- **Windows:** use *Git Bash* or *PowerShell*.

Every command in this guide is typed into a terminal, followed by **Enter**.

---

## Step 1: Go into the project folder

Every command in this guide should be run from the **main project folder**
(the one that contains the `apps` and `packages` folders), **not** from inside
`apps/web`.

```bash
cd path/to/funavry-website
```

Replace `path/to/` with where the folder actually is on your computer. For
example: `cd ~/Desktop/repos/funavry/funavry-website`.

---

## Step 2: Download the project's code packages (one time, and after updates)

```bash
npm install
```

**What this does:** downloads all the third-party code the project depends on
into a folder called `node_modules`. It can take a few minutes the first time.

**When to run it again:** whenever you pull new changes from Git and someone
has added a new package. If something suddenly breaks after an update, running
this is a good first thing to try.

Then build the shared "types" package, which the other three parts depend on:

```bash
npm run build:types
```

**What this does:** prepares a small shared package (`packages/types`) that
describes what the data looks like, so all three parts agree with each other.
If you skip this, the backend or admin panel may fail to start with an error
mentioning `@funavry/types`.

---

## Step 3: Set up the database (one time only)

We need to create an empty database and a user account the backend can use to
log into it.

### 3a. Open MySQL as the main (root) user

```bash
sudo mysql
```

On Mac or Windows, or if that doesn't work, try `mysql -u root -p` and enter
the root password you chose when installing MySQL.

Your prompt should now look like `mysql>`. You are now "inside" MySQL.

### 3b. Paste these commands

Copy all of this, paste it in, and press Enter. **Change `a-strong-password`**
to a password of your choice in both places, and remember it, because you'll
need it in Step 4.

```sql
CREATE DATABASE funavry_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'funavry_app'@'localhost'  IDENTIFIED BY 'a-strong-password';
CREATE USER 'funavry_app'@'127.0.0.1'  IDENTIFIED BY 'a-strong-password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON funavry_cms.* TO 'funavry_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON funavry_cms.* TO 'funavry_app'@'127.0.0.1';
```

**What this does, in plain words:**

- Creates an empty database called `funavry_cms`.
- Creates a user called `funavry_app` with your password.
- Lets that user read and write data, but **not** delete the whole database.
  That's a safety measure.

### 3c. Leave MySQL

```sql
exit
```

---

## Step 4: Create the settings files (one time only)

Each of the three parts needs a small settings file (called a `.env` file) that
tells it things like "where is the database" and "what's the secret password".
Example files are already included. You just copy them and fill in the blanks.

### 4a. Copy the example files

```bash
cp apps/api/.env.example   apps/api/.env
cp apps/web/.env.example   apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

On Windows PowerShell, use `copy` instead of `cp`.

> Files starting with a dot (`.env`) are **hidden** by default. In VS Code they
> show up normally. In Finder press `Cmd + Shift + .` to see them.

### 4b. Make four secret keys

Run this command **four times**. Each time it prints a different long random
string. Copy each one somewhere temporarily.

```bash
openssl rand -base64 48
```

These are like passwords the programs use to protect logins. **Never share them
or commit them to Git.**

### 4c. Fill in the backend settings: `apps/api/.env`

Open `apps/api/.env` in a text editor and fill in these lines:

| Line | What to put |
| --- | --- |
| `DB_PASSWORD=` | The password you chose in Step 3b |
| `JWT_ACCESS_SECRET=` | Secret #1 |
| `JWT_REFRESH_SECRET=` | Secret #2 (**must be different** from #1) |
| `COOKIE_SECRET=` | Secret #3 |
| `REVALIDATE_SECRET=` | Secret #4 |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | The login for the first admin account. The defaults are `admin` / `admin@funavry.com` / `admin1234`. You can leave them or change them. |

Leave everything else as it is.

> **Important:** the backend checks these settings when it starts. If a secret
> is missing or too short, **it will refuse to start** and tell you which one.
> That's on purpose.

### 4d. Fill in the website settings: `apps/web/.env.local`

Only one line needs filling in:

| Line | What to put |
| --- | --- |
| `REVALIDATE_SECRET=` | **Exactly the same** Secret #4 you used in `apps/api/.env` |

This shared secret is how the website knows a "please refresh" message really
came from the backend and not from a stranger.

The other lines (`API_URL`, `NEXT_PUBLIC_SITE_URL`) are already correct for
running on your own computer.

### 4e. Admin panel settings: `apps/admin/.env.local`

Nothing to change. The defaults already point at the backend on port 4000.

---

## Step 5: Build the database tables and load the content (one time only)

### 5a. Create the tables

```bash
npm run migration:run
```

**What this does:** a "migration" is a set of instructions that builds the
database's structure: the tables for case studies, services, users, and so on
(36 tables). Think of it as putting shelves in the empty pantry.

### 5b. Fill the tables with content

```bash
npm run seed
```

**What this does:** "seeding" puts the starting content into the database: all
the case studies, services, industries, offices, team members, client logos and
images the website already had. It also creates the first admin account from
`SEED_ADMIN_*`.

It is safe to run more than once. It won't create duplicates.

---

## Step 6: Start everything (every time you work)

Each part runs in **its own terminal window**, and you leave it running. Open
**three terminal windows** (or three tabs) and in each one go to the project
folder first (Step 1).

Start them **in this order**, because the website and admin panel need the
backend to be running.

### Terminal 1: Backend (API)

```bash
npm run dev:api
```

Wait until you see a message like:

```
Funavry CMS API listening on port 4000 — prefix /api/v1
```

- Address: <http://localhost:4000/api/v1>
- API documentation, which lists every endpoint and lets you try them:
  <http://localhost:4000/api/v1/docs>

### Terminal 2: CMS (Admin panel)

```bash
npm run dev:admin
```

Wait until it says `Ready`. Then open <http://localhost:3001> in your browser.

- Log in with the **username or email** and **password** from `SEED_ADMIN_*`
  (default: `admin` / `admin1234`).
- On your **first login it will ask you to change the password**. This is
  normal. Choose a new one and remember it.

### Terminal 3: Frontend (Website)

```bash
npm run dev:web
```

Wait until it says `Ready`. Then open <http://localhost:3000> in your browser.

The first time you open a page it may take a few seconds to load. That's
normal in development mode, because the page is being built on the spot.

### You're done 🎉

| What | Address |
| --- | --- |
| Website | <http://localhost:3000> |
| Admin panel (CMS) | <http://localhost:3001> |
| Backend API | <http://localhost:4000/api/v1> |
| API docs | <http://localhost:4000/api/v1/docs> |

### Stopping

Click into each terminal and press **`Ctrl + C`**. To start again next time,
just repeat **Step 6**. Steps 0–5 are one-time setup.

---

## Running only the website (without the backend)

If you only want to look at or work on the website's design, you **can run it
on its own**:

```bash
npm run dev:web
```

When the website can't reach the backend, it automatically falls back to a
**saved copy** of the content stored in `apps/web/src/data/cms-snapshot.json`.
You'll see a warning in the terminal like `... serving the snapshot`. That's
expected and harmless.

Keep in mind:

- The saved copy is only as fresh as the last time someone updated it (see
  below). Recent edits made in the admin panel won't appear.
- Some text on the site (the homepage hero, the About page numbers, the job
  listings, the "Life at Funavry" page, etc.) is written directly in the code,
  **not** in the CMS. Editing it means changing the code, not using the admin
  panel.

### Updating the saved copy (snapshot)

After content has been changed in the admin panel, refresh the saved copy so
the website can still show the latest content without a backend:

```bash
# The backend (Terminal 1) must be running for this
npm run cms:snapshot
```

Then commit the changed files (`apps/web/src/data/cms-snapshot.json` and
`apps/web/public/cms/`) to Git.

---

## Everyday cheat sheet

| I want to... | Command |
| --- | --- |
| Start the backend | `npm run dev:api` |
| Start the admin panel | `npm run dev:admin` |
| Start the website | `npm run dev:web` |
| Install packages after pulling new code | `npm install` |
| Rebuild the shared types after pulling | `npm run build:types` |
| Apply new database changes after pulling | `npm run migration:run` |
| Undo the last database change | `npm run migration:revert` |
| Reload the starting content | `npm run seed` |
| Refresh the website's saved content copy | `npm run cms:snapshot` |
| Build everything for production | `npm run build` |

**After pulling new code from Git**, it's a good habit to run these three
before starting:

```bash
npm install
npm run build:types
npm run migration:run
```

---

## Something went wrong?

| Problem | Likely cause and fix |
| --- | --- |
| `node: command not found` | Node.js isn't installed. See Step 0. |
| `Cannot find module '@funavry/types'` | Run `npm run build:types`. |
| Backend says a secret is missing, invalid or too weak | Open `apps/api/.env` and fill in the secrets from Step 4b. Make sure the two JWT secrets are different. |
| Backend says `Access denied for user 'funavry_app'` | The `DB_PASSWORD` in `apps/api/.env` doesn't match the password from Step 3b. |
| Backend says `ECONNREFUSED ... 3306` | MySQL isn't running. Linux: `sudo systemctl start mysql`. Mac: `brew services start mysql`. |
| Backend says `Unknown database 'funavry_cms'` | You skipped Step 3. Create the database. |
| Backend says a table doesn't exist | Run `npm run migration:run` (Step 5a). |
| `Port 3000 (or 3001/4000) is already in use` | That program is already running in another terminal. Close it with `Ctrl + C`, or find the other window. |
| Admin panel login fails | Check the username/password in `SEED_ADMIN_*`. If you already changed the password on first login, use the new one. Too many wrong attempts lock the account for 15 minutes. |
| Admin panel shows network errors | The backend (Terminal 1) isn't running. |
| I edit something in the admin panel but the website doesn't change | Make sure `REVALIDATE_SECRET` is **exactly** the same in `apps/api/.env` and `apps/web/.env.local`, then restart both. Also check that the thing you're looking at actually comes from the CMS (some sections are written in code). |
| Website shows old content and a `serving the snapshot` warning | The website can't reach the backend. Start it with `npm run dev:api`. |
| Everything is weird after pulling new code | Run `npm install`, `npm run build:types`, `npm run migration:run`, then restart all three. |

---

## Glossary

- **Frontend:** the part people see and click on (the website).
- **Backend / API:** a program running behind the scenes that stores data and
  hands it out when asked. "API" stands for *Application Programming
  Interface*. It's basically a menu of requests other programs can make.
- **CMS (Content Management System):** a dashboard for editing website content
  without touching code. Here, that's the admin panel.
- **Database (MySQL):** where all the content is permanently saved, organised
  in tables like a set of spreadsheets.
- **localhost:** "this computer". `http://localhost:3000` means "the program
  running on my own machine, on door number 3000".
- **Port:** the number after `localhost:`. Each program uses its own number so
  they don't clash (3000, 3001, 4000).
- **`.env` file:** a private settings file with passwords and addresses. Never
  shared or uploaded to Git.
- **npm:** the tool that installs code packages and runs the project's commands
  (`npm run ...`).
- **Migration:** a step-by-step instruction that changes the database's
  structure (adds a table, adds a column).
- **Seed:** loading starting data into an empty database.
- **Snapshot:** a saved copy of the CMS content, so the website can work even
  when the backend isn't running.
- **Revalidate:** the website throwing away its cached copy of a page and
  rebuilding it with fresh content.
