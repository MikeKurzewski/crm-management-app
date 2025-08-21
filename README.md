# Supabase + Next.js (App Router) + Tailwind v4 + shadcn/ui — Dashboard Starter

A production-grade SaaS dashboard starter with **Auth**, **Organizations & Roles (RLS)**, **Invite-by-Email**, and a modern dashboard shell.

- **Framework:** Next.js App Router (v15+)
- **UI:** React, Tailwind v4, shadcn/ui
- **Auth/DB:** Supabase (`@supabase/ssr`, RLS policies)
- **Multi-tenant:** orgs + admin/member roles
- **Invites:** admin creates link → invitee signs in → auto-joins org

---

## Features

### Dashboard Navigation & Routes

- After login, users are redirected to `/app/<firstOrgId>` if they have orgs, or see an empty state (create org) if not.
- The dashboard shell includes:
  - **Topbar:** app name, logo, (future actions)
  - **Sidebar:** 
    - Org Switcher (combobox/select, disabled if only one org)
    - Profile section (avatar, full name, Edit profile button → `/app/profile`)
    - Navigation: "My Organisation" → `/app/[orgId]/org` (room for future items)
- All routes are org-aware: `/app/[orgId]` is the dashboard home for the selected org.
- Organisation page (`/app/[orgId]/org`):
  - Admins see editable org details (name, description, logo URL) and InviteMemberForm.
  - Members see read-only org details.
- Profile page (`/app/profile`): edit full name and avatar URL (self only).

### Org Edit/Admin Behavior

- Only org admins can edit org details or invite members (UI and API enforced).
- Members see org details read-only; no invite/edit UI.
- API: `PUT /api/orgs/:id` updates org for admins; returns 403 for non-admins.

### Profile Edit Notes

- Profile page uses shadcn Form, Input, Button, zod + react-hook-form.
- Updates `public.profiles` for the current user only.
- On success: toast + redirect back to last visited org dashboard (or stay and show success).

### Next.js 15 & Technical Guidelines

- All server code uses `await createClient()` and awaits async `cookies()`.
- Dynamic route `params` are async and must be awaited in layouts/pages/route handlers.
- **Tailwind v4** is used. **Do NOT add `eslint-plugin-tailwindcss`** (v3-only; conflicts with v4).
- Use `@supabase/ssr` helpers for Next.js App Router.
- Path alias: `@/*` → `./src/*` (see `tsconfig`).
- Add more shadcn/ui components as needed:
  ```bash
  npx shadcn@latest add <component>
  ```
- All UI is built with shadcn/ui and Tailwind v4. Placeholders are present for forms/components; replace with actual shadcn/ui code as needed.

### Test Plan

- Auth works; `/app` redirects to `/app/<firstOrgId>` when user has orgs.
- Sidebar shows Org Switcher (multiple orgs) or a disabled single org.
- Sidebar shows profile avatar/name and Edit profile button → `/app/profile`.
- "My Organisation" nav goes to `/app/[orgId]/org`:
  - Members see read-only org details.
  - Admins see Org edit form and Invite members section.
- `PUT /api/orgs/:id` updates org for admins; 403 for non-admins.
- Profile page updates full_name, avatar_url for self only.
- All server code awaits createClient(); dynamic route pages await params where required.
- No usage of eslint-plugin-tailwindcss. Tailwind v4 UI renders correctly.

---

## Project Structure

```
/src
  /app
    /(public)
      /signin/page.tsx         # tabs + next-param handling + emailRedirectTo
    /(protected)
      /app/layout.tsx          # dashboard shell (Topbar, Sidebar, content)
      /app/page.tsx            # redirects to /app/<firstOrgId> or shows NewOrgForm
      /app/[orgId]/page.tsx    # org dashboard home
      /app/[orgId]/org/page.tsx # org details (admin/member views)
      /app/profile/page.tsx    # profile edit page
    /api/health/route.ts
    /api/me/route.ts
    /api/orgs/route.ts         # list/create org (RPC)
    /api/orgs/[id]/route.ts    # GET org, PUT org (admin-only PUT)
    /api/invites/route.ts      # create invite (admin-only, returns joinUrl)
    /join/[token]/page.tsx     # await params; accept invite; redirect /app
  /components
    /shell/Topbar.tsx
    /shell/Sidebar.tsx
    /org/OrgSwitcher.tsx
    /org/OrgForm.tsx
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
    client.ts                  # browser client (createBrowserClient)
    server.ts                  # server client (await cookies(), getAll/setAll)
  /app/globals.css
/middleware.ts                 # (optional) extra guard; layout already protects
.env.example
components.json                # shadcn config
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

## License

MIT
