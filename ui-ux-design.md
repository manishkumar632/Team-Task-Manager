# Lumen — UI/UX Design Documentation

This document describes the UI/UX design of **Lumen**, the Team Task Manager dashboard implemented in this Next.js + Express project. It captures the design philosophy, visual language, structural decisions, and interaction patterns actually present in the codebase (`frontend/app/page.tsx`, `frontend/app/globals.css`, `frontend/app/layout.tsx`).

---

## 1. Design Philosophy & Visual Direction

Lumen follows a **soft premium pastel SaaS** aesthetic — a calm, modern, and confidence-inspiring interface designed for daily team productivity work.

Core principles:

- **Calm over loud.** A milky lavender background, soft cool-blue tints, and faint borders keep visual noise low so task data stays in focus.
- **Premium feel through depth, not decoration.** Depth is achieved with gentle layered shadows and rounded geometry rather than gradients or illustrations.
- **Productivity-first density.** Information is dense but breathable: every metric, chart, and list has clear hierarchy and whitespace around it.
- **Dribbble-quality polish.** Generous corner radii (24–32px), gradient accents on the active state, and subtle hover lifts give the dashboard a finished, designed feel.
- **Pastel fintech meets productivity LMS.** The palette and rhythm borrow from pastel fintech dashboards; the structure (sidebar + workspace + utility panel) borrows from learning/productivity tools.

---

## 2. Layout Structure

The dashboard uses a **three-column layout** built with CSS Grid and Flexbox:

1. **Left Sidebar (`<aside>`, `w-64`)**
   - Brand mark (gradient tile + "Lumen / Task Manager" wordmark).
   - Primary navigation list.
   - "Upgrade to Pro" promo card pinned to the bottom.
   - User identity row with avatar, role label ("Admin · Premium"), and logout icon.
   - Hidden under `lg` breakpoint to free space on smaller screens.

2. **Central Workspace (`<main>`, `flex-1`)**
   - **Header bar** with page title, subtitle greeting, search field, message and notification icons, and a user chip.
   - **Task bucket cards** (To Do, In Progress, Done, Overdue).
   - **Task activity bar chart** + **Sprint donut chart** in a 1.6fr / 1fr split.
   - **Team workload area chart** (this week vs last week).
   - **Active projects** grid of three cards.

3. **Right Utility Panel (`340px` column on `xl`)**
   - Today's schedule.
   - Overdue alerts.
   - Recent activity feed.
   - Quick stats grid.

The outer grid is defined as `grid-cols-1 xl:grid-cols-[1fr_340px]`, so the utility panel collapses below the workspace on smaller screens.

---

## 3. Color Palette

All colors are defined as semantic tokens in `frontend/app/globals.css` using the **OKLCH** color space, ensuring perceptually uniform tints and predictable contrast.

### Surfaces
- `--background`: `oklch(0.985 0.01 270)` — milky lavender canvas.
- `--card`: pure white for elevated surfaces.
- `--muted`: `oklch(0.96 0.015 270)` — used for chart backgrounds and inactive chips.
- `--border` / `--input`: `oklch(0.93 0.02 280)` — faint cool-blue separators.

### Brand & Accents
- `--primary`: `oklch(0.58 0.19 285)` — saturated indigo-violet.
- `--primary-glow`: `oklch(0.74 0.14 285)` — lighter twin used in gradients.
- `--gradient-primary`: `linear-gradient(135deg, oklch(0.62 0.2 285), oklch(0.74 0.14 260))` — used on the active nav item, brand tile, progress bars, and chart highlights.
- `--gradient-soft`: subtle lavender-to-pastel wash for the upgrade card.

### Semantic States
- `--success`: minty green (`oklch(0.78 0.13 160)`) — "On track" badges, Done counts.
- `--warning`: warm pastel amber.
- `--info`: soft blue — "To Do" chip.
- `--destructive`: coral red — Overdue chip and notification dot.
- `--pink`: pastel pink — Product/Design tags and "last week" comparison line.

### Shadows
- `--shadow-card`: small, low-spread shadow for resting cards.
- `--shadow-soft`: deeper shadow used on hover and on the active gradient elements.

### Usage Rules
- Components never use raw color literals; they consume CSS variables (`bg-card`, `text-muted-foreground`, `bg-[image:var(--gradient-primary)]`, etc.).
- Per-category accents (Design, Web, Product) use lightweight inline OKLCH chips so the same color family can carry both background and text contrast.

---

## 4. Typography

- **Primary typeface:** `Plus Jakarta Sans` (loaded via `next/font/google` in `layout.tsx`, exposed as `--font-sans`).
- **Monospace:** `Geist Mono` (`--font-geist-mono`) reserved for code-like contexts.
- **Heading scale:**
  - `h1` page title — `text-3xl font-bold tracking-tight`.
  - Section titles — `text-lg font-semibold`.
  - Card titles — `font-semibold tracking-tight`.
  - Metric numbers — `text-3xl font-bold tracking-tight`.
- **Body & meta:** `text-sm` for descriptions, `text-xs` and `text-[11px]` / `text-[10px]` for chip labels and meta information.
- **Hierarchy is reinforced by color**, not just size: primary copy uses `text-foreground`, secondary copy uses `text-muted-foreground`.
- The `tracking-tight` modifier on headings and metrics gives the interface its modern, confident feel.

---

## 5. Spacing, Sizing & Alignment

- **Base unit:** Tailwind's 4px scale. Cards use `p-5` / `p-6`; sections separate with `gap-6`; navigation items use `px-3 py-2.5`.
- **Radius scale:** declared in `globals.css` from `--radius` (`1rem`) up through `--radius-4xl`. The interface leans on the upper end:
  - Pills/buttons: `rounded-full`.
  - Nav items, chart bars: `rounded-2xl`.
  - Cards and panels: `rounded-3xl`.
- **Alignment:** flex with `items-center justify-between` is the dominant pattern for header rows of every card, ensuring titles and controls always sit on the same baseline.
- **Whitespace:** generous outer padding (`px-6 lg:px-10 py-6`) and `mb-8` under the header create the "breathable" rhythm characteristic of premium SaaS dashboards.

---

## 6. Component Design Language

### Cards
- White surface, `rounded-3xl`, faint border (`border-border/60`), `shadow-card` at rest.
- Hover: `-translate-y-0.5` + `shadow-soft` for a subtle lift.

### Buttons
- Primary: `rounded-full`, gradient or solid `bg-primary`, white text.
- Icon buttons: `size-11 rounded-full bg-card border` for header utilities (search, bell, message).
- Tertiary/text: primary-colored text with icon (e.g. "+ New project").

### Badges & Chips
- Pill-shaped (`rounded-full`), `text-[11px] font-medium`, paired background + text color from the same hue family for accessible contrast.
- Used for task buckets, project tags (Design/Web/Product), sprint status ("On track"), and category tags in schedules.

### Inputs
- Search field uses a pill-shaped container (`rounded-full`, `h-11`, card surface, soft shadow) with a leading icon and transparent input — matching the rest of the rounded-full control family.

### Avatars
- Circular (`rounded-full`), 36px (`size-9`), pastel hue per person with high-contrast initials. Color hue varies by user (lavender, blue, pink, mint, amber) to aid quick recognition.

### Progress Bars
- Track: `bg-muted`, `rounded-full`, `h-2`.
- Fill: `bg-[image:var(--gradient-primary)]` matching the brand gradient.

### Charts
- **Bar chart**: rounded `rounded-2xl` bars, muted lavender for inactive, gradient + soft shadow for the highlighted day, with a floating value tooltip.
- **Donut**: SVG with a muted background ring and a gradient stroke, center label showing percentage and "completed".
- **Area chart**: gradient-filled area with a solid primary line for "this week" and a dashed pink line for "last week", plus a focal point dot.

### Lists (Schedule, Activity, Updates)
- Stacked rows with leading time/avatar, primary text, and right-aligned meta. Dividers are implicit through spacing rather than hard rules.

---

## 7. Navigation & User Flow

- **Primary navigation** lives in the left sidebar and exposes the entire product surface: Dashboard, Projects, My Tasks, Team Members, Deadlines, Activity Timeline, Progress Tracking, Overdue Alerts.
- The **active item** is visually unmistakable: it switches from muted text to the brand gradient background with white text and a soft shadow, providing strong location feedback.
- **Inactive items** are low-contrast (`text-muted-foreground`) but get a soft `hover:bg-accent` state to remain discoverable.
- **Header utilities** (search, messages, notifications, user chip) form a secondary nav for cross-cutting actions.
- **Quick CTAs** (e.g. "+ New project") appear inline next to the section they affect, reducing navigation cost.
- **Role surfacing**: the user chip and sidebar footer both display the role ("Admin"), preparing the UI for role-based admin / member views.

---

## 8. Dashboard Design Approach

The dashboard is structured around four progressive layers of information:

1. **Status at a glance** — the four task bucket cards answer "what's the state of work right now?".
2. **Trend & momentum** — the activity bar chart and sprint donut answer "are we on pace?".
3. **Capacity** — the workload area chart answers "is the team over- or under-loaded?".
4. **Where to act** — active projects and the right-side panels (today's schedule, overdue alerts, recent activity) answer "what should I do next?".

This top-down flow mirrors how a team lead actually scans a dashboard: state → trend → capacity → action.

---

## 9. Responsive Behavior

The layout is fully responsive using Tailwind breakpoints:

- **`< lg` (≈1024px):** sidebar hidden (`hidden lg:flex`); central workspace fills the screen. Header search hidden under `md`; user chip hidden under `sm`.
- **`< xl` (≈1280px):** right utility panel collapses below the main column (the grid becomes `grid-cols-1`).
- **Task buckets:** `grid-cols-2` on small screens, `lg:grid-cols-4` on larger ones.
- **Activity + Sprint section:** stacks on mobile (`grid-cols-1`), splits 1.6fr/1fr on `lg`.
- **Active projects:** single column on mobile, `md:grid-cols-3` from tablet up.
- Charts use SVG `viewBox` so they scale fluidly within their containers.
- Padding scales: `px-6 lg:px-10` keeps mobile tight and desktop airy.

---

## 10. Accessibility & Usability

- **Color contrast:** OKLCH tokens are tuned so foreground text on every surface meets readable contrast; muted text is reserved for non-critical meta.
- **Semantic landmarks:** `<aside>`, `<main>`, `<header>`, `<nav>`, `<section>` are used appropriately for screen-reader navigation.
- **Focus & hover states:** interactive elements (nav items, buttons, cards) all have visible hover transitions; focus rings inherit from the `--ring` token.
- **Iconography with text:** navigation items pair every icon with a label; status chips combine an icon and a word so meaning never depends on color alone.
- **Notification clarity:** the bell icon uses both a positional dot and a strong destructive color to flag unread items.
- **Touch targets:** rounded buttons are sized at `size-11` (44px), satisfying common touch-target guidelines.
- **Readable typography:** Plus Jakarta Sans at `text-sm`/`text-base` with comfortable line spacing keeps long sessions low-fatigue.

---

## 11. Interaction Patterns & Micro-interactions

- **Hover lift on cards:** `hover:-translate-y-0.5` + shadow upgrade on task buckets and project cards conveys interactivity without being noisy.
- **Gradient elevation:** the active nav item, primary buttons, and the highlighted bar share the same gradient + soft shadow, creating a consistent "this is the focal element" cue.
- **Segmented control:** the Week / Month / Quarter switcher above the activity chart uses a pill-in-pill pattern with a card-elevated active option.
- **Tooltip-as-label:** the highlighted bar shows its value in a floating dark pill above it, mimicking chart tooltips without requiring hover.
- **Soft transitions:** `transition` / `transition-all` are applied to color, shadow, and transform changes to keep state changes smooth.
- **Non-blocking status:** badges like "On track" provide instant reassurance without modal interruptions.

---

## 12. Consistency Rules

The interface enforces a small set of rules that repeat across every component:

1. **Tokens, not literals.** All colors, radii, and shadows come from CSS variables in `globals.css`.
2. **Three radius tiers.** `rounded-full` for controls and pills, `rounded-2xl` for inner elements (nav items, bars), `rounded-3xl` for outer cards.
3. **One gradient.** A single brand gradient is reused for active states, primary fills, progress bars, and the brand mark — never re-invented per component.
4. **One shadow language.** Two shadows only: `--shadow-card` at rest, `--shadow-soft` on hover/active.
5. **Pastel chip pairing.** Every category badge pairs a `~0.94` lightness background with a `~0.4` lightness text in the same hue.
6. **Header pattern reuse.** Every card opens with a left-aligned title block + right-aligned action/meta — making the dashboard feel orchestrated.
7. **Avatar identity.** Each teammate keeps the same hue across schedule, project, and activity surfaces.

---

## 13. How the Design Supports a Team Task Manager

Every visual decision maps back to the product's core job — helping a team plan, track, and ship work together:

- **Buckets surface workload state immediately.** A glance at To Do / In Progress / Done / Overdue tells the team where attention is needed without opening a board.
- **Sprint donut + activity chart frame momentum.** Leads can answer "are we on track for this sprint?" in seconds.
- **Workload curve protects the team.** Comparing this week vs last week makes overload patterns visible before they become burnout.
- **Active projects with progress bars and member avatars** condense each initiative into a scannable status card — owner, deadline, completion all visible at once.
- **Right-rail utility panel keeps the day actionable.** Today's schedule, overdue alerts, and recent activity provide the "what should I do next?" answer right next to the strategic dashboard.
- **Role-aware chrome (Admin · Premium)** is built into both the sidebar footer and the header chip, paving the way for role-based admin vs member views.
- **Calm pastel palette** reduces cognitive load during long planning sessions, while the brand gradient consistently directs attention to the most important action or status.

Together these choices produce an interface that feels premium and friendly while staying ruthlessly focused on its real job: making team task management fast, clear, and a little bit delightful.