# Team Task Manager

A full‑stack team task management app where users create projects, assign tasks, and track progress with **role‑based access (Admin / Member)**.

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS v4, shadcn/ui
- **Backend:** Node.js, Express 5, JWT auth, bcrypt, Zod validation, rate‑limiting
- **Database:** Supabase Postgres (accessed server‑side only via the service‑role key)
- **Storage (optional):** Cloudinary (signed direct uploads for avatars)

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Project layout](#2-project-layout)
3. [Set up Supabase + run migrations](#3-set-up-supabase--run-migrations)
4. [Configure & run the backend](#4-configure--run-the-backend)
5. [Configure & run the frontend](#5-configure--run-the-frontend)
6. [Create your first user **and the admin**](#6-create-your-first-user-and-the-admin)
7. [Features (what each page does)](#7-features-what-each-page-does)
8. [Role‑based access — the rules](#8-rolebased-access--the-rules)
9. [REST API reference](#9-rest-api-reference)
10. [Database schema](#10-database-schema)
11. [Troubleshooting](#11-troubleshooting)
12. [Security notes](#12-security-notes)

---

## 1. Prerequisites

- **Node.js** ≥ 18 — <https://nodejs.org>
- **npm** (bundled with Node)
- A free **Supabase** account — <https://supabase.com>
- *(Optional)* A free **Cloudinary** account if you want avatar uploads

---

## 2. Project layout

```
Team-Task-Manager/
├── backend/                    # Express REST API (port 4000)
│   ├── migrations/
│   │   ├── 001_profiles.sql    # auth users (run first)
│   │   └── 002_app_schema.sql  # projects / tasks / activity (run second)
│   └── src/
│       ├── server.js
│       ├── db.js               # Supabase service-role client
│       ├── lib/activity.js
│       ├── middleware/auth.js  # requireAuth + requireRole
│       └── routes/             # auth, projects, tasks, team, activity, stats, uploads
└── frontend/                   # Next.js 16 app (port 3000)
    ├── app/
    │   ├── login/  signup/
    │   └── (app)/              # protected pages: dashboard, projects, tasks, team, ...
    ├── components/
    └── lib/                    # api client, auth context
```

---

## 3. Set up Supabase + run migrations

1. Create a new project at <https://supabase.com/dashboard> and wait for it to finish provisioning.
2. **Project Settings → API** — copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **`service_role` secret key** (click *Reveal* — starts with `sb_secret_…`)
3. **SQL Editor → New query** and run, in order:
   1. `backend/migrations/001_profiles.sql`
   2. `backend/migrations/002_app_schema.sql`
4. **Table Editor → public** — confirm these tables exist: `profiles`, `projects`, `project_members`, `tasks`, `activity_log`.

> The `service_role` key bypasses Row‑Level Security and is only ever used server‑side by the Express API. **Never** put it in any `NEXT_PUBLIC_*` variable, frontend file, or git commit.

---

## 4. Configure & run the backend

```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...your-service-role-key...

# Generate with: openssl rand -base64 48
JWT_SECRET=replace-with-a-long-random-string

# Optional — only needed if you want avatar uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=lumen/avatars
```

Start it:

```bash
npm run dev      # nodemon, watches for changes
# or: npm start  # production mode
```

The API runs on **http://localhost:4000**. Health check: `GET http://localhost:4000/health` → `{ "ok": true }`.

---

## 5. Configure & run the frontend

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start it:

```bash
npm run dev
```

The app runs on **http://localhost:3000**.

---

## 6. Create your first user **and the admin**

> **There is no pre‑seeded admin account.** Every user that signs up is created with `role = 'member'`. You promote the first admin by running a single SQL update once. After that, any admin can promote other members from the UI (Team Members page).

### Step‑by‑step

1. Open <http://localhost:3000>, click **Sign up**, and create an account, e.g. `you@example.com` / `your-password`.
2. Open Supabase → **SQL Editor** and run **one** of the following to promote that account to admin:

   ```sql
   -- promote a specific email
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

   *(Alternatively, in Table Editor open `profiles`, find your row, change `role` from `member` to `admin`, save.)*

3. **Log out and log back in** in the app. The new role is baked into your JWT, so you must get a fresh token.
4. You should now see:
   - Trash (delete) icons on project cards
   - A **Promote to admin / Demote to member** link next to every other user on **Team Members**
   - The ability to edit/delete any task

### Logging in

There is no separate "admin dashboard" URL — the same UI at <http://localhost:3000> shows additional controls when your account has `role = 'admin'`. Use the email and password **you just created** in step 1; the role lives on the user record, not on a different login screen.

### What credentials should I use?

| | Email | Password |
|---|---|---|
| **Admin** | the email you signed up with above (after running the SQL `update` to promote it) | the password you chose at signup |
| **Member** | any other email someone signs up with | their own password |

Passwords are stored as bcrypt hashes in `profiles.password_hash`; **the project itself does not know your plaintext password**, only the hash. If you forget it, fix it with:

```sql
-- TEMP: only do this in dev. It wipes the user so you can re-signup with the same email.
delete from public.profiles where email = 'you@example.com';
```

---

## 7. Features (what each page does)

| Page | Path | What it does |
|---|---|---|
| **Login / Signup** | `/login`, `/signup` | Email + password auth. Issues a JWT (7‑day expiry) stored in `localStorage`. |
| **Dashboard** | `/` | Headline numbers for the logged‑in user: tasks by status (To Do / In Progress / Done / Overdue), weekly completion bars, sprint progress. |
| **Projects** | `/projects` | List every project with progress bar (`done / total tasks`), tag, color, due date, members. **Create** new projects, **Edit** (owner or admin) name/tag/color/due/members, **Delete** (admin only). |
| **My Tasks** | `/tasks` | Kanban‑style 3 columns (To Do / In Progress / Done). Toggle between **Mine** (assigned to me) and **All**. Create tasks with title, description, priority, project, assignee, due date. Drag‑drop is via the per‑card status dropdown. |
| **Team Members** | `/team` | Everyone in the workspace with their role badge and per‑user open/done task counts. **Admins** also see Promote/Demote buttons next to other users. |
| **Deadlines** | `/deadlines` | Tasks sorted by `due_date`. |
| **Activity Timeline** | `/activity` | Chronological feed of `created`, `completed`, `moved`, `updated` events from `activity_log`. |
| **Progress Tracking** | `/progress` | Per‑project completion (computed from each project's tasks). |
| **Overdue Alerts** | `/overdue` | Tasks whose `due_date` is in the past and `status ≠ done`. |
| **Settings** | `/settings` | Update your own name, avatar (uploaded to Cloudinary), and plan. |

### How "progress" is calculated

For each project, the Projects card and the Progress page show `task_done / task_total` and a percentage:

```
progress = round( count(tasks where project_id = P and status = 'done') / count(tasks where project_id = P) * 100 )
```

A task with `project_id = null` does **not** count toward any project's progress — make sure to attach tasks to a project if you want them tracked.

### Why "My Tasks" might look empty after creating a task

The **Mine** filter shows only tasks where `assignee_id = your user id`. If you created a task and left the assignee blank or assigned it to someone else, it shows up under **All** instead of **Mine**. The app auto‑switches to **All** in this case to make the task visible.

---

## 8. Role‑based access — the rules

Two roles exist: `admin` and `member` (stored in `profiles.role` and embedded in the JWT).

| Action | Member | Admin |
|---|:---:|:---:|
| Sign up / log in | ✅ | ✅ |
| View projects, tasks, team, activity, stats | ✅ | ✅ |
| Create a project | ✅ (becomes the project owner) | ✅ |
| Edit a project (name, tag, color, due, members) | ✅ only if **owner** | ✅ any project |
| Delete a project | ❌ | ✅ |
| Create a task | ✅ | ✅ |
| Edit / move a task | ✅ only if **creator** or **assignee** | ✅ any task |
| Delete a task | ✅ only if **creator** | ✅ any task |
| Promote / demote another user | ❌ | ✅ |
| Change own role | ❌ | ❌ (blocked even for admins, to prevent lockout) |

Enforcement lives in `backend/src/middleware/auth.js` (`requireAuth`, `requireRole`) and in the `canManageProject` / `canMutateTask` helpers inside `backend/src/routes/projects.js` and `tasks.js`.

The frontend mirrors these rules visually (hides delete buttons, etc.) but the backend is the source of truth — every protected mutation is re‑checked there.

---

## 9. REST API reference

Base URL: `http://localhost:4000`. All `/api/*` endpoints (except `/api/auth/signup` and `/api/auth/login`) require a header:

```
Authorization: Bearer <jwt>
```

The JWT is returned by `signup` / `login` and contains `{ sub: <user id>, email, role }`. It expires after **7 days**.

Errors are JSON: `{ "error": "<message>" }` with appropriate HTTP status (`400` validation, `401` missing/invalid token, `403` forbidden by RBAC, `404` not found, `409` duplicate, `500` server error).

### 9.1 Auth — `/api/auth`

`POST /api/auth/signup` *(public, rate‑limited 20/15min)*
```json
// body
{ "email": "you@example.com", "password": "min8chars", "name": "You" }
// 201 response
{ "token": "eyJ...", "user": { "id": "...", "email": "...", "name": "...", "role": "member", "plan": "free", "avatar_url": null, "created_at": "..." } }
```

`POST /api/auth/login` *(public, rate‑limited 20/15min)*
```json
{ "email": "you@example.com", "password": "..." }
// → { token, user }
```

`GET /api/auth/me` — returns the currently authenticated user.

`PATCH /api/auth/me` — update your own profile.
```json
{ "name": "New name", "avatar_url": "https://...", "plan": "pro" }
```

### 9.2 Projects — `/api/projects`

`GET /api/projects` — list every project, each enriched with `members`, `task_total`, `task_done`, `progress` (%).

`POST /api/projects`
```json
{ "name": "Website", "tag": "Design", "color": "violet", "due_date": "2026-06-01", "member_ids": ["uuid-1","uuid-2"] }
```
The creator is auto‑added as the **owner** and a member.

`PATCH /api/projects/:id` — owner or admin only. All fields optional. Passing `member_ids` replaces the project's member list (owner is always preserved).

`DELETE /api/projects/:id` — **admin only**.

### 9.3 Tasks — `/api/tasks`

`GET /api/tasks?status=&project_id=&assignee=me|<uuid>&overdue=1` — filter is optional. `assignee=me` resolves to the caller.

`POST /api/tasks`
```json
{
  "title": "Design homepage",
  "description": "Hero + features",
  "status": "todo",                  // todo | in_progress | done
  "priority": "high",                 // low | medium | high
  "project_id": "uuid-or-null",
  "assignee_id": "uuid-or-null",
  "due_date": "2026-05-20T17:00:00.000Z"
}
```
`creator_id` is set from the JWT.

`PATCH /api/tasks/:id` — **creator, assignee, or admin** only. Setting `status: "done"` stamps `completed_at`; un‑doing it clears `completed_at` and logs an activity entry.

`DELETE /api/tasks/:id` — **creator or admin** only.

### 9.4 Team — `/api/team`

`GET /api/team` — every profile in the workspace + `open_tasks` and `done_tasks` counts.

`PATCH /api/team/:id/role` — **admin only**. Cannot change your own role.
```json
{ "role": "admin" }   // or "member"
```

### 9.5 Activity — `/api/activity`

`GET /api/activity?limit=50` — most recent entries first (max `limit` = 200). Auto‑populated by writes to projects and tasks.

### 9.6 Stats — `/api/stats`

`GET /api/stats/overview` — JSON used by the dashboard:
```json
{
  "buckets":  { "todo": 3, "in_progress": 1, "done": 7, "overdue": 2 },
  "week":     { "days": ["Mon",...,"Sun"], "completed": [0,2,1,0,3,0,0] },
  "sprint":   { "done": 7, "active": 1, "backlog": 3, "pct": 64 },
  "counts":   { "tasks_total": 11, "my_tasks": 5 }
}
```

### 9.7 Uploads — `/api/uploads`

`POST /api/uploads/cloudinary-signature` — returns a signed payload the browser can use to upload directly to Cloudinary. Each user's avatars are scoped to a per‑user subfolder. Requires `CLOUDINARY_*` env vars.

### 9.8 Health

`GET /health` — `{ "ok": true }` (unauthenticated).

---

## 10. Database schema

Created by the two migrations under `backend/migrations/`.

**`profiles`** *(001_profiles.sql + 002 adds `plan`)*
```
id uuid pk            email text unique     name text
password_hash text    role text ('admin'|'member')   plan text ('free'|'pro'|'premium')
avatar_url text       created_at / updated_at timestamptz
```

**`projects`**
```
id uuid pk            name text             tag text     color text
owner_id → profiles   due_date date         created_at / updated_at
```

**`project_members`** *(many‑to‑many)*
```
project_id → projects   user_id → profiles   added_at
primary key (project_id, user_id)
```

**`tasks`**
```
id uuid pk            title text            description text
status text ('todo'|'in_progress'|'done')   priority text ('low'|'medium'|'high')
project_id → projects (set null on delete)
assignee_id → profiles (set null on delete)
creator_id → profiles (cascade)
due_date timestamptz   completed_at timestamptz   created_at / updated_at
```

**`activity_log`**
```
id uuid pk   actor_id → profiles   verb text   target_type text   target_id uuid   message text   created_at
```

RLS is enabled on every table as a defense‑in‑depth measure. The Express API uses the `service_role` key, which bypasses RLS — all access control happens in the route handlers.

---

## 11. Troubleshooting

| Symptom | Likely fix |
|---|---|
| 500 on `/api/auth/signup` or `/login` | Migrations not run, or `SUPABASE_SERVICE_ROLE_KEY` is wrong (must be `sb_secret_…`, **not** `sb_publishable_…`). |
| `new row violates row-level security policy` in backend logs | You're using the publishable/anon key as the service‑role key. Replace it. |
| Logged in but no admin controls show | You promoted yourself in SQL but didn't get a fresh JWT. Log out and log back in. |
| New task doesn't appear in **My Tasks** | It was created without an assignee, or assigned to someone else. Switch the toggle to **All**. |
| Project progress stays at 0% | The task has `project_id = null`. Edit the task and pick a project. |
| CORS error in browser | `FRONTEND_URL` in `backend/.env` doesn't match the URL the frontend is served from. Comma‑separate multiple origins if needed. |
| Cloudinary upload fails | `CLOUDINARY_*` env vars missing or incorrect. |
| `429 Too Many Requests` on login | Auth rate limit (20 attempts / 15 min per IP). Wait or restart the backend. |

---

## 12. Security notes

- Passwords are hashed with **bcryptjs** (`cost = 10`). Plaintext is never stored or logged.
- JWTs are signed with `JWT_SECRET` and expire after 7 days. Rotate the secret if it leaks; all sessions become invalid.
- Roles live on the `profiles` row and are baked into the JWT at login. A user must re‑login after a role change for the new role to take effect.
- The Supabase `service_role` key is server‑side only. Never put it into a `NEXT_PUBLIC_*` variable, never commit `backend/.env`, never paste it into the browser.
- `/api/auth/signup` and `/api/auth/login` are rate‑limited (20 requests / 15 min per IP).
- All mutating endpoints validate input with **Zod** before touching the database.