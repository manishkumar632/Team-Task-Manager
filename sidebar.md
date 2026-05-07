# Sidebar — Lumen Task Manager

Detailed reference for the dashboard sidebar used in `frontend/app/page.tsx`.

## Overview

The sidebar is the primary navigation surface of the Lumen dashboard. It is rendered as a **floating card** that sits inside a padded shell next to the main content, rather than as a full-height rail attached to the viewport edge. This gives the layout an "app inside an app" feel and visually echoes the rounded card aesthetic used throughout the dashboard.

- **Location in code:** `frontend/app/page.tsx` — the `<aside>` element (top of `Home`).
- **Visibility:** hidden below the `lg` breakpoint (`hidden lg:flex`).
- **Behavior:** sticky, scrolls independently of the page when content overflows.

## Anatomy

The sidebar is composed of four stacked sections inside a single rounded card:

1. **Brand block** — gradient logo tile + product name (`Lumen`) and subtitle (`Task Manager`).
2. **Primary navigation** — vertical list of links (Dashboard, Projects, My Tasks, Team Members, Deadlines, Activity Timeline, Progress Tracking, Overdue Alerts). Each item is an icon + label.
3. **Upgrade card** — soft-gradient promo block with an `Upgrade` CTA, pinned near the bottom via `mt-auto`.
4. **User row** — avatar, name (`Manish Mukhiya`), role/plan, and a logout icon button.

The nav data lives in the `nav` array at the top of `page.tsx`; each entry is `{ label, icon, active? }`.

## Layout & sizing

| Property | Value | Notes |
|---|---|---|
| Width | `w-64` (16rem) | Fixed across all `lg+` screens. |
| Height | `h-[calc(100vh-2rem)]` | Fits inside the outer `p-4` shell so it never touches the viewport edge. |
| Position | `sticky top-4` | Stays in view while the main content scrolls. |
| Outer padding | `p-4` on the parent flex row | Creates the gap that makes the card "float". |
| Gap to main | `gap-4` on the parent | Consistent breathing room between sidebar and main. |
| Internal padding | `px-5 py-6` | Comfortable padding for nav items. |
| Overflow | `overflow-y-auto` | Independent scroll if many nav items are added. |

## Card styling

The card look is achieved with these utility classes on the `<aside>`:

```
bg-card/80 backdrop-blur
border border-border/60
rounded-3xl
shadow-[var(--shadow-soft)]
```

- `bg-card/80 backdrop-blur` — translucent card surface that picks up the page background subtly.
- `border border-border/60` — soft 1px border using the design-system border token at 60% opacity.
- `rounded-3xl` — large radius (`calc(var(--radius) * 2.2)` ≈ 2.2rem) matching the dashboard cards.
- `shadow-[var(--shadow-soft)]` — soft purple-tinted elevation defined in `globals.css`.

Tokens used (from `frontend/app/globals.css`):

- `--card`, `--border`, `--muted-foreground`, `--accent`, `--accent-foreground`
- `--primary`, `--primary-foreground`
- `--gradient-primary`, `--gradient-soft`
- `--shadow-soft`, `--shadow-card`

No raw color values are used — everything routes through CSS variables so theming and dark mode stay consistent.

## Navigation item states

Each nav link is a styled `<a>`:

- **Default:** `text-muted-foreground` with `hover:bg-accent hover:text-accent-foreground` and `rounded-xl` pill shape.
- **Active:** `bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-soft)]` — the brand gradient pill seen on `Dashboard` in the reference design.
- **Icon:** Lucide icon at `size-4`, paired with the label.
- **Spacing:** `px-3 py-2.5`, `gap-3` between icon and text.

The active state is currently driven by the `active: true` flag in the `nav` array. To make it route-aware in Next.js App Router, replace the flag with a comparison against `usePathname()` and switch the `<a>` to `next/link`'s `Link`.

## Brand block

```
size-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]
grid place-items-center text-white
```

Contains a `Sparkles` icon. Title `Lumen` is `font-semibold tracking-tight`; subtitle is `text-[11px] text-muted-foreground`.

## Upgrade card

A nested rounded card pinned to the bottom of the sidebar with `mt-auto`:

- Background: `bg-[image:var(--gradient-soft)]`
- Radius: `rounded-2xl`
- Border: `border border-border/60`
- CTA: full-width pill button using `bg-primary text-primary-foreground`

Use this slot for plan upgrades, announcements, or tips. Keep copy under ~12 words so it doesn't push the user row out of view.

## User row

- Avatar: `size-9 rounded-full` with a soft pastel background (`oklch(0.88 0.06 285)`) and initials text.
- Name: `text-sm font-medium truncate` so long names don't break the layout.
- Meta line: `text-[11px] text-muted-foreground` (e.g. `Admin · Premium`).
- Logout: `LogOut` icon button, muted by default, darkens on hover.

The row is separated from the upgrade card with `border-t border-border/60` and `pt-2`.

## Responsive behavior

- **`< lg` (≤ 1023px):** sidebar is hidden (`hidden lg:flex`). On these breakpoints the dashboard relies on the top header for navigation. If a mobile drawer is needed later, wrap the sidebar contents in a Sheet/Drawer and trigger it from a hamburger button in the header.
- **`≥ lg`:** sidebar is always visible as the floating card.

## Accessibility

- The sidebar uses a semantic `<aside>` and an inner `<nav>` so assistive tech can identify it as a complementary landmark with navigation inside.
- Each link should have a discernible label — the icon + text pattern already satisfies this; if labels are ever hidden (collapsed mode), add `aria-label` per link.
- Active link is conveyed visually via the gradient pill. For screen readers, also set `aria-current="page"` on the active link when wiring up routing.
- Keyboard focus rings come from the global `outline-ring/50` rule in `globals.css`.

## Extending the sidebar

**Add a nav item**

```ts
// frontend/app/page.tsx
const nav = [
  // ...
  { label: "Reports", icon: BarChart3 },
];
```

Import the icon from `lucide-react` at the top of the file.

**Make active state follow the URL**

```tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pathname = usePathname();
// ...
{nav.map((n) => {
  const href = `/${n.label.toLowerCase().replace(/\s+/g, "-")}`;
  const active = pathname === href;
  return (
    <Link
      key={n.label}
      href={href}
      aria-current={active ? "page" : undefined}
      className={/* same classes, swap n.active for active */}
    >
      <n.icon className="size-4" />
      {n.label}
    </Link>
  );
})}
```

Note: turning `Home` into a client component requires `"use client"` at the top of `page.tsx` or extracting the sidebar into its own client component (`frontend/components/sidebar.tsx`) — recommended once it grows.

**Add a section divider**

```tsx
<p className="px-3 mt-4 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
  Workspace
</p>
```

**Collapsible / icon-only mode** — not implemented. If added, keep the floating card shape, drop width to `w-16`, hide labels, and keep icons centered with `justify-center`.

## Files involved

- `frontend/app/page.tsx` — sidebar markup and nav data.
- `frontend/app/globals.css` — design tokens (`--card`, `--border`, `--gradient-primary`, `--gradient-soft`, `--shadow-soft`, etc.).
- `frontend/app/layout.tsx` — fonts (`Plus_Jakarta_Sans`) and base body styles.

## Change log

- **Floating card refactor:** sidebar moved from a flush `border-r` rail to a floating rounded card (`rounded-3xl`, `shadow-[var(--shadow-soft)]`, sits inside a `p-4`/`gap-4` shell with sticky `top-4`).
