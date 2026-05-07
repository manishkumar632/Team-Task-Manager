# Team Task Manager

A full-stack team task management app built with a **Next.js** frontend and an **Express + Supabase** backend.

- **Frontend:** Next.js 16, React 19, TailwindCSS v4, shadcn/ui
- **Backend:** Node.js, Express 5, Supabase (Postgres), JWT auth, bcrypt
- **Database:** Supabase Postgres (`profiles` table for auth)

---

## 1. Prerequisites

Make sure you have installed:

- **Node.js** ≥ 18 ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- A **Supabase** account ([https://supabase.com](https://supabase.com)) — free tier is fine

---

## 2. Clone the project

```bash
git clone <your-repo-url>
cd Team-Task-Manager
```

The repo has two apps:

```
Team-Task-Manager/
├── backend/     # Express API (port 4000)
└── frontend/    # Next.js app (port 3000)
```

---

## 3. Set up Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Wait for the project to finish provisioning.
3. From the left sidebar, open **Project Settings → API** and copy:
   - **Project URL** → e.g. `https://xxxxx.supabase.co`
   - **`service_role` secret key** (click *Reveal* — starts with `sb_secret_…`)

> ⚠️ The `service_role` key bypasses Row Level Security. **Never** put it in the frontend or commit it to git.

### 3.1 Run the database migration

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open the file `backend/migrations/001_profiles.sql` in this repo.
3. Copy its full contents into the SQL editor and click **Run**.
4. Open **Table Editor → public** and confirm the `profiles` table exists.

---

## 4. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env` and fill in:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...your-service-role-key...

# Generate with: openssl rand -base64 48
JWT_SECRET=replace-with-a-long-random-string
```

Generate a strong `JWT_SECRET`:

```bash
openssl rand -base64 48
```

### Start the backend

```bash
npm run dev
```

The API will run on **http://localhost:4000**.

---

## 5. Configure the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Start the frontend

```bash
npm run dev
```

The app will run on **http://localhost:3000**.

---

## 6. Try it out

1. Open [http://localhost:3000](http://localhost:3000).
2. Click **Sign up** and create an account.
3. Log in with the same credentials.

If signup/login fails with a 500 error, check the backend terminal for the exact Supabase error (most often a missing `profiles` table or wrong `SUPABASE_SERVICE_ROLE_KEY`).

---

## 7. Project scripts

### Backend (`/backend`)
| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start API in watch mode (nodemon)    |
| `npm start`     | Start API in production mode         |

### Frontend (`/frontend`)
| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start Next.js dev server             |
| `npm run build` | Build for production                 |
| `npm start`     | Start production server              |
| `npm run lint`  | Run ESLint                           |

---

## 8. Folder structure

```
backend/
├── migrations/
│   └── 001_profiles.sql       # Run this in Supabase SQL editor
├── src/                       # Express server, routes, middleware
├── .env.example
└── package.json

frontend/
├── app/                       # Next.js App Router (pages: /, /login, /signup, ...)
├── components/                # UI components (shadcn/ui)
├── lib/                       # Client utilities (API client, auth helpers)
├── public/
├── .env.local                 # NEXT_PUBLIC_API_URL
└── package.json
```

---

## 9. Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| `500` on `/api/auth/signup` or `/api/auth/login` | Missing `profiles` table → run the migration in section 3.1 |
| `Invalid API key` in backend logs | `SUPABASE_SERVICE_ROLE_KEY` is wrong — must be the **secret** key, not `sb_publishable_…` |
| `new row violates row-level security policy` | Same as above — you're using the anon/publishable key |
| CORS error in browser | `FRONTEND_URL` in `backend/.env` doesn't match where the frontend runs |
| Frontend can't reach backend | `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is wrong, or backend isn't running |

---

## 10. Security notes

- Never commit `backend/.env` or `frontend/.env.local`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` variable or in client-side code.
- Rotate `JWT_SECRET` and the Supabase service-role key if either is ever leaked.

readme updated