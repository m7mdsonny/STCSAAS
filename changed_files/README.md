# 📦 AI-VAP Platform Activation - Change Log (Super Admin Driven)

All modified files are mirrored here. Apply them 1:1 into the repo to keep the super-admin dashboard authoritative for every platform surface (web, mobile, edge).

## What Changed (Path ➜ Why ➜ Feature ➜ Deploy)

- `apps/cloud-laravel/database/migrations/2024_01_01_000000_create_core_platform_tables.php`
  - **Why:** Extend the schema to cover analytics, AI training/policies, and richer event context.
  - **Feature:** Adds org-linked events, analytics reports/dashboards/widgets tables, AI policies/training events, plus existing tenant/licensing/branding/sms/backup structures.
  - **Deploy:** `php artisan migrate` (PostgreSQL). Mandatory.

- `apps/cloud-laravel/app/Http/Controllers/AnalyticsController.php` + `app/Models/Analytics*`
  - **Why:** Power intelligent, comprehensive analytics used by portal buttons (`/api/v1/analytics/*`).
  - **Feature:** Summaries, time-series, per-location/module breakdowns, response-time percentiles, compare, export, report CRUD + generation, dashboards + widgets. Aggregates from the events table so UI charts show real data.
  - **Deploy:** No extra steps post-migration.

- `apps/cloud-laravel/app/Http/Controllers/AiPolicyController.php` + `app/Models/AiPolicy*`
  - **Why:** Allow super admin to teach AI with events and push org-specific behavior instantly across web/mobile/edge.
  - **Feature:** Global/org AI policies (modules, thresholds, actions, feature flags) with labeled training events and an `effective` endpoint for edge/mobile to pull live configs.
  - **Deploy:** Configure via super-admin token; no extra steps beyond migration.

- `apps/cloud-laravel/app/Http/Controllers/EventController.php` & `EdgeController.php`
  - **Why:** Tie events to organizations/edge servers and capture org/license context during heartbeat.
  - **Feature:** Event ingest auto-links to the posting edge so analytics and AI rules stay tenant-aware; edges can send org/license IDs each heartbeat.
  - **Deploy:** Edges should include `organization_id` (and optional `license_id`) when heartbeating.

- `apps/cloud-laravel/routes/api.php`
  - **Why:** Expose all new analytics and AI policy routes under `/api/v1` for web, mobile, and edge consumers.
  - **Feature:** Admin buttons now reach live Laravel endpoints (analytics, AI policies, reports, dashboards, widgets, export).
  - **Deploy:** `php artisan route:clear` recommended.

- `apps/web-portal/src/lib/apiClient.ts`
  - **Why:** Normalize endpoint resolution so mixed `/api/v1` calls don’t double-prefix and all buttons hit the correct Laravel URLs.
  - **Feature:** Web portal API hooks work against the updated backend without manual URL tweaks.
  - **Deploy:** Rebuild frontend if serving bundled assets from Laravel `public/`.

- `apps/cloud-laravel/database/migrations/2024_01_02_000000_add_is_super_admin_to_users.php`
  - **Why:** Schema previously lacked the `is_super_admin` flag referenced by auth logic and Tinker workflows, blocking super-admin creation.
  - **Feature:** Adds a boolean `is_super_admin` column so you can promote users and issue Sanctum tokens that pass super-admin gate checks.
  - **Deploy:** Run `php artisan migrate` (idempotent: checks column existence).

- `apps/cloud-laravel/app/Http/Controllers/Controller.php` & `app/Models/User.php`
  - **Why:** Align runtime checks/casts with the new `is_super_admin` column.
  - **Feature:** Super-admin guard now allows either `role === 'super_admin'` or `is_super_admin = true`; casting ensures boolean semantics.
  - **Deploy:** No extra step beyond migration.

## Deployment Steps (Minimal)
1) Backend: `composer install --no-dev && php artisan migrate && php artisan route:clear && php artisan config:clear`
2) Frontend (if bundling into Laravel): `npm install && npm run build` then copy `dist/` into `apps/cloud-laravel/public/`
3) Permissions: ensure `storage/` and `bootstrap/cache/` are writable.

## Mandatory vs Optional
- **Mandatory:** Migration + all backend controllers/models/routes + apiClient change.
- **Optional:** Rebuild frontend only if you serve it via Laravel `public/`.

## Notes for QA
- Super-admin-only mutations are guarded (reports/dashboards/widgets/AI policies). Read endpoints remain available to authenticated users.
- Analytics pulls from real `events` records; ingest now tags org/edge so charts are tenant-aware.
- AI policy “effective” endpoint lets edge/mobile fetch the latest config instantly after super admin saves.
