# Supabase + Next.js (App Router) + Tailwind v4 + shadcn/ui — Org Dashboard Starter

A production-grade SaaS dashboard starter with **Auth**, **Organizations & Roles (RLS)**, **Invite-by-Email**, **Members management**, and a modern dashboard shell.

---

## 2025 UI & Theming Upgrade

**This project is now fully upgraded to:**
- **Tailwind CSS v4**: Uses new `@import "tailwindcss";` syntax, v4 preflight, and CSS variable theming.
- **shadcn/ui v4 patterns**: All UI primitives (Table, Select, Badge, Skeleton, Command, Popover, Dropdown Menu, Form, etc.) are implemented using shadcn/ui, following the latest docs and best practices.
- **Theming**: Uses CSS variables for all theme tokens (background, foreground, radius, etc.), with class-based dark mode (`.dark` on `<html>`) and a custom `ThemeProvider` (next-themes) at the app shell level.
- **Consistent Design**: All forms, tables, nav, and empty/loading states use shadcn primitives for visual and interaction parity with the latest shadcn/ui docs.
- **Accessibility**: Improved aria-labels, keyboard navigation, focus ring tokens, and a11y for all interactive elements.
- **Visual Parity**: Members table, invites list, org switcher, and forms all match shadcn/ui spacing, border, and focus ring standards.
- **Grouped PR Commits**: All changes are organized by type (chore, feat, refactor, fix) for clear review.

---

## Infrastructure & Stack

- **Framework:** Next.js App Router (v15+), using Server and Client Components with async cookies()/params.
- **UI:** React, Tailwind v4, shadcn/ui (all UI is production-lean, accessible, and responsive).
- **Database:** Supabase (Postgres) with Row Level Security (RLS) and custom RPCs for safe role management and invites.
- **Auth:** Supabase Auth, with user profiles and organization membership.
- **API:** Next.js Route Handlers for all org/member/invite endpoints, using @supabase/ssr for server-side Supabase clients.
- **Migrations:** All schema and RPC changes are tracked in /supabase/migrations.
- **No dynamic imports with ssr: false in Server Components.** All Client Components are statically imported.
- **No function props are passed from Server → Client components.** Only serializable data is passed.

---

## Features

### Dashboard Navigation & Routes

- After login, users are redirected to `/app/<firstOrgId>` if they have orgs, or see an empty state (Card) if not.
- The dashboard shell includes:
  - **Topbar:** app name, logo, (future actions)
  - **Sidebar:** 
    - Org Switcher (shadcn Command + Popover combobox, disabled if only one org)
    - Profile section (avatar, full name, Edit profile button → `/app/profile`)
    - Navigation: "My Organisation" → `/app/[orgId]/org`, "Profile" → `/app/profile`
- All routes are org-aware: `/app/[orgId]` is the dashboard home for the selected org.
- Organisation page (`/app/[orgId]/org`):
  - Admins see editable org details (name, description, logo URL), InviteMemberForm, Members table, and Pending Invites.
  - Members see read-only org details and the Members table.
- Profile page (`/app/profile`): edit full name and avatar URL (self only).

### Members Management

- **Members Table:** uses shadcn Table, Select, Badge, Skeleton, and Toast (sonner). Lists all members with their roles, name, email, and avatar.
- **Role Management:** admins can change any member’s role via shadcn Select; last admin demotion is blocked (server and UI).
- **Self-demotion:** UI disables changing own role if only one admin; server enforces last-admin safety.
- **RLS:** all member queries and updates are protected by Row Level Security.
- **API:** `/api/orgs/:id/members` GET returns all members with profile info; PUT changes a member's role via the set_member_role RPC.

### Invites Management

- **Invite Form:** admins can invite by email and select the invitee’s role (admin/member) using shadcn Form, Input, Select, Button, Toast, react-hook-form, and zod.
- **Pending Invites:** uses shadcn Table, Dropdown Menu, Badge, Skeleton. Lists all pending invites for the org, with email, role, created/expires, and a Dropdown Menu for actions (copy link, cancel).
- **Invite Flow:** after creating an invite, the list can be refreshed; once accepted, the invite disappears.
- **Security:** only admins can create and view invites; backend and RPCs enforce admin checks.
- **API:** `/api/orgs/:id/invites` GET returns pending invites for admins; `/api/invites` POST creates an invite (admin-only, calls create_org_invite RPC).

### Profile Editing

- Profile page uses shadcn Form, Input, Button, zod + react-hook-form.
- Updates `public.profiles` for the current user only.
- On success: toast + redirect back to last visited org dashboard (or stay and show success).

---

## Implementation Details

- **Tailwind v4:** Uses new `@import "tailwindcss";` and v4 preflight. PostCSS config uses `@tailwindcss/postcss`.
- **Theming:** All theme tokens are CSS variables, with `.dark` class on `<html>` for dark mode. ThemeProvider (next-themes) wraps the app shell.
- **shadcn/ui:** All UI primitives are shadcn components, following v4 docs (Table, Select, Badge, Skeleton, Command, Popover, Dropdown Menu, Form, etc.).
- **Accessibility:** All forms and tables are tabbable, submit on enter, aria-labels, and keyboard-friendly. Focus ring tokens are used for consistent a11y.
- **Loading and error states:** All forms and tables show shadcn Skeleton for loading and Toast (sonner) for errors.
- **Supabase RLS and RPCs:** All sensitive actions (role change, invite creation) are enforced by RLS and custom RPCs (e.g., set_member_role prevents last admin demotion).
- **Migrations:** All schema and RPC changes are tracked in /supabase/migrations, including:
  - Initial orgs/roles/invites setup
  - Dashboard metadata (org/profile fields)
  - set_member_role RPC for safe role changes

---

## Project Structure

```
/src
  /app
    /(public)
      /signin/page.tsx
    /(protected)
      /app/layout.tsx
      /app/page.tsx
      /app/[orgId]/page.tsx
      /app/[orgId]/org/page.tsx
      /app/profile/page.tsx
    /api/health/route.ts
    /api/me/route.ts
    /api/orgs/route.ts
    /api/orgs/[id]/route.ts
    /api/orgs/[id]/members/route.ts
    /api/orgs/[id]/invites/route.ts
    /api/invites/route.ts
    /join/[token]/page.tsx
  /components
    /shell/Topbar.tsx
    /shell/Sidebar.tsx
    /org/OrgSwitcher.tsx
    /org/OrgForm.tsx
    /org/MembersTable.tsx
    /org/PendingInvitesList.tsx
    /nav/AppNav.tsx
    /profile/ProfileCard.tsx
    /profile/EditProfileForm.tsx
    /ui/button.tsx
    /ui/card.tsx
    /ui/form.tsx
    /ui/input.tsx
    /ui/label.tsx
    /ui/select.tsx
    /ui/avatar.tsx
    /ui/separator.tsx
    /ui/command.tsx
    InviteMemberForm.tsx
    NewOrgForm.tsx
    SignOutButton.tsx
  /lib/supabase
    client.ts
    server.ts
  /app/globals.css
/middleware.ts
.env.example
components.json
/supabase
  /migrations/
    ..._init_orgs_roles_invites.sql
    ..._dashboard_metadata.sql
    ..._set_member_role.sql
```

---

## Supabase Schema (summary)

* `organizations(id, name, description, logo_url, created_by, created_at)`
* `profiles(id ↦ auth.users, full_name, avatar_url, created_at)`
  * Trigger `on_auth_user_created` → `handle_new_user()`
* `organization_members(org_id, user_id, role 'admin'|'member', invited_by, created_at)`
  * **RLS:** members read/insert; admins update/delete
* Helpers (**security definer**):
  * `is_org_member(org_id) → boolean`
  * `is_org_admin(org_id) → boolean`
* RPCs:
  * `create_org_with_admin(name) → org_id`
  * `create_org_invite(org_id, email, role?, expires_at?) → token`
  * `accept_org_invite(token) → org_id`
  * `set_member_role(org_id, user_id, role)` — safe role change, prevents last admin demotion
* `org_invites(token, org_id, email, role, invited_by, created_at, expires_at, accepted_at)`
  * **RLS:** admins of that org can read

> Policy recursion is avoided by using **security-definer** helpers inside policies (no self-joins in `USING`).

---

## API Endpoints

* `GET /api/health` → `200 { ok: true }`
* `GET /api/me` → `200` with user JSON (authed) / `401` otherwise
* `GET /api/orgs` → list my orgs
* `POST /api/orgs` → `{ id }` (calls `create_org_with_admin`)
* `GET /api/orgs/:id` → get org by id (RLS enforced)
* `PUT /api/orgs/:id` → update org (admin-only; returns 403 for non-admins)
* `GET /api/orgs/:id/members` → list org members with profile info (RLS enforced)
* `PUT /api/orgs/:id/members` → change member role (admin-only, safe RPC)
* `GET /api/orgs/:id/invites` → list pending invites (admin-only)
* `POST /api/invites` → `{ token, joinUrl }` (admin-only; calls `create_org_invite`)

---

## Auth, Invites & Redirects

* **Join link**: `/join/:token`
  * If not signed in → redirects to `/signin?next=/join/:token`
  * `/signin` stores `next` in `localStorage`
  * After login/confirmation, it redirects back to `next`
  * `/join/:token` runs `accept_org_invite(token)` then redirects to `/app`

---

## Supabase CLI (migrations)

For a **new project** created from this template:

```bash
# Link to your Supabase project
supabase link --project-ref <YOUR-REF>

# Apply existing migrations from this repo
supabase db push
```

Capture changes you make via SQL Editor:

```bash
# Generate a baseline diff from remote → creates a migration file
supabase db diff -f 20YYMMDD_init_orgs_roles_invites --schema public,auth

git add -A
git commit -m "chore(db): baseline orgs+roles+invites"
git push
```

Local stack (optional):

```bash
supabase db reset   # spin local DB and apply migrations
```

---

## Roadmap / Extending

* Add CRM tables (e.g., `leads`) with org_id, created_by, timestamps, RLS
* Webhooks / background jobs via Route Handlers or edge functions
* Role variants (viewer, billing_admin) or per-feature permissions

---

## Test Plan

- Auth works; `/app` redirects to `/app/<firstOrgId>` when user has orgs.
- If no orgs, user sees a clear Card-based empty state.
- Sidebar shows Org Switcher (shadcn Command + Popover) or a disabled single org, with aria-label for accessibility.
- Sidebar shows profile avatar/name and Edit profile button → `/app/profile`.
- "My Organisation" nav goes to `/app/[orgId]/org`:
  - Members see read-only org details and the Members table.
  - Admins see Org edit form, Invite form (with shadcn Form), Members table (shadcn Table/Select/Badge/Skeleton/Toast), and Pending Invites (shadcn Table/Dropdown Menu/Badge/Skeleton).
- All forms (OrgForm, EditProfileForm, InviteMemberForm) use shadcn Form primitives, show loading Skeletons, error Toasts, and are accessible (tabbable, submit on enter).
- Members table allows admins to change roles, blocks last admin demotion, and persists changes to the backend.
- Pending invites appear with a Dropdown Menu for actions; once accepted, they disappear on refresh.
- All server code awaits createClient(); dynamic route pages await params where required.
- No dynamic imports with ssr: false in Server Components; all Client Components are statically imported.
- No function props are passed from Server → Client components; only serializable data is passed.
- No usage of eslint-plugin-tailwindcss. Tailwind v4 UI renders correctly.
- No obvious placeholders remain; all UI is production-lean and shadcn-native.

---

## License

MIT
