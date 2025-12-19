# Phase 05 — Feature Completion Readiness Audit

This document records the current state of critical features before implementation work begins. All observations are taken from the existing codebase as of this phase and highlight where functionality is incomplete, mocked, or non-operational. No production code was changed outside this folder, per the phase boundary instructions.

## Authentication & Login
- **Risk:** Credentials were reported as not working post-changes. The backend `AuthController` uses `email/password` with Sanctum tokens, but no session-based login is exposed for the web portal (tokens only). Frontend `AuthContext` expects token storage, but there is no validation that stored tokens remain valid, and automatic refresh is absent.
- **Action Needed:** Validate the seeded users in PostgreSQL, confirm Sanctum token issuance, and ensure the web portal can consume `/auth/login` successfully against the live API host. Add login regression tests.

## Platform Updates / Announcements
- **Current Implementation:** `UpdateAnnouncementController` provides CRUD with publish toggle; frontend `AdminUpdates.tsx` calls `/updates` and `/updates/{id}/toggle`.
- **Gap:** No server-side validation of body size or sanitization; public endpoint `/public/updates` is read-only and working by code, but no e2e test exists to confirm publish flow.
- **Action Needed:** Add integration tests to verify create → publish → public listing, plus input sanitization.

## Backup System
- **Current API:** `SystemBackupController@store` expects an uploaded `backup` file; it simply stores the file and records a DB row. `restore` only checks existence and returns a placeholder message.
- **Gaps / Non-functional paths:**
  - The web portal calls `POST /backups` with **no file payload**, so backups cannot succeed.
  - No download route is exposed; UI links point directly to `file_path`, which is a storage path, not a public URL.
  - `restore` does **not** execute any database or filesystem restore logic—only returns a JSON message.
  - No background job, queue, or maintenance mode handling to protect data during restore.
- **Action Needed:**
  - Add real backup creation (DB dump + storage), signed download URLs, and actual restore (database import + storage sync) with auditing.
  - Update frontend to upload/download via signed routes and display status.

## Database Upload / Restore
- **Current State:** No controller or route exists for database upload/restore beyond the placeholder backup restore noted above. The web portal has no UI for database uploads.
- **Action Needed:** Implement dedicated endpoints for database import/export with validation, size limits, and admin gating; add frontend wiring and progress feedback.

## Backup List / Download / Restore Verification
- **List:** `/backups` returns rows, but relies on manual file upload; metadata is minimal.
- **Download:** No download endpoint; direct storage path exposure risks 404 and security issues.
- **Restore:** Not implemented; returns static message.
- **Action Needed:** Implement authenticated download and real restore, plus status tracking and logging.

## Repository Cleanup
- **Observations:** Legacy overlays (`update-phase-0x` folders, `changed_files/`) remain. They duplicate production code but are unused at runtime. Supabase migrations also remain under `/supabase/migrations` even though the stack is PostgreSQL + Laravel.
- **Action Needed:** Remove unused overlays and dead code paths, consolidate migrations, and ensure only active Laravel code remains.

## Edge / Event Ingestion
- **Current Implementation:** `EventController@ingest` creates events linked to an edge by `edge_id`, but there is no camera linkage or validation of payload consistency (e.g., severity domain, occurred_at timezone).
- **Action Needed:** Enrich ingestion with camera associations, stricter validation, and per-org authorization for edge IDs.

## AI Command Center
- **Status:** Routes and models exist; queue/ack/retry flows are coded. Lacks job dispatch to actual edge transport and no security scoping per organization.
- **Action Needed:** Wire to message broker or WebSocket push to edges; add org scoping and audit logs.

## Testing Coverage
- **Gap:** No automated tests for the critical features above (auth, updates, backups, restore).
- **Action Needed:** Add feature tests in Laravel and component/e2e tests for the web portal.

## Next Steps (Execution Plan)
1. Implement real backup pipeline (create/list/download/restore) with signed URLs and background jobs.
2. Fix web portal backup UI to upload archives and poll status; add restore progress + confirmations.
3. Add database upload/restore endpoints and UI, reusing backup safety mechanisms.
4. Validate and harden login flow against live API, adding regression tests.
5. Sanitize and test platform updates publishing; ensure public feed reflects publish toggles.
6. Clean repository overlays and remove unused Supabase artifacts after verifying no dependencies.

> This audit is scoped to `update-phase-05-feature-completion` to comply with phase constraints. No application behavior has been modified yet.

## Implementation Notes

The following application changes were applied in this phase to close the audit gaps. Existing runtime files live under `apps/cloud-laravel`; these were updated directly and are documented here per the phase boundary instructions.

### Authentication & Login
- Hardened login to reject disabled accounts and normalize emails before credential checks.
- Added regression tests under `apps/cloud-laravel/tests/Feature/AuthLoginTest.php` to cover successful login and blocked accounts.
- Enforced case-insensitive email matching on both API and web portal requests to prevent regressions when stored addresses include uppercase characters.

### Platform Updates / Announcements
- Added length limits and HTML sanitization for update bodies to prevent oversized or unsafe payloads.

### Backup System
- Implemented database-aware backup creation when no file is uploaded.
- Added authenticated download endpoint and executable restore workflow for PostgreSQL/MySQL using native client tools.
- Added sqlite-safe dump/restore handling so automated tests and local verification runs can execute without external clients.

### Automated Verification
- Added `apps/cloud-laravel/tests/Feature/SystemBackupControllerTest.php` to exercise backup creation, download, and restore end-to-end under Sanctum authentication.

### Edge / Event Ingestion
- Added strict severity whitelist, camera metadata capture, and organization scoping against the authenticated user when ingesting events.

### Touched Files (outside this folder)
- `apps/cloud-laravel/app/Http/Controllers/AuthController.php`
- `apps/cloud-laravel/app/Http/Controllers/SystemBackupController.php`
- `apps/cloud-laravel/app/Http/Controllers/UpdateAnnouncementController.php`
- `apps/cloud-laravel/app/Http/Controllers/EventController.php`
- `apps/cloud-laravel/routes/api.php`
- `apps/cloud-laravel/tests/Feature/AuthLoginTest.php`
- `apps/cloud-laravel/tests/Feature/SystemBackupControllerTest.php`

## Verification Steps

### Login (Web + API)
1. Ensure the Laravel API server is running with the configured database and Sanctum enabled.
2. Use the seeded or admin account to obtain a token via API:
   - `curl -X POST http://<host>/api/v1/auth/login -d 'email=<email>' -d 'password=<password>'`
   - Expect HTTP 200 with `{ "token": "...", "user": {"email": "<email>"} }`.
3. Validate token persistence through a page refresh by calling the profile endpoint:
   - `curl -H "Authorization: Bearer <token>" http://<host>/api/v1/auth/me`
   - Expect HTTP 200 with the same user payload; failures indicate expired or invalid tokens.
4. For the web portal, log in through the UI and confirm the dashboard loads and subsequent API requests include the stored token (network tab shows `Authorization: Bearer ...`).
5. If existing accounts were created with uppercase or spaced email values, repeat the API login using the same email casing; the controller now performs a lowercase comparison so tokens should be issued successfully, and the web portal automatically lowercases input before submission.

### Backup and Restore (super admin only)
1. Authenticate as a `super_admin` or `is_super_admin` user and capture the token.
2. Create a database backup (auto-dump if no file is provided):
   - `curl -X POST http://<host>/api/v1/backups -H "Authorization: Bearer <token>"`
   - Expect HTTP 201 with `status` set to `completed` and a `file_path` under `backups/`.
3. Download the generated archive:
   - `curl -L -H "Authorization: Bearer <token>" http://<host>/api/v1/backups/<id>/download --output backup.sql`
   - File should save without 4xx/5xx responses.
4. Restore from the backup to confirm data rollback works:
   - Make a deliberate data change (e.g., create a temporary user via the UI or API).
   - `curl -X POST http://<host>/api/v1/backups/<id>/restore -H "Authorization: Bearer <token>"`
   - Expect HTTP 200 with `Database restored successfully`; verify the temporary change is gone and `system_backups.status` reads `restored`.

### Repository Cleanup Confirmation
- The legacy overlay folders and Supabase migrations were removed: `changed_files/`, `update-phase-01-web-portal-auth-integration/`, `update-phase-02-superadmin-core/`, `update-phase-03-platform-operations/`, `update-phase-04A-ai-command-center/`, and `supabase/`.
- Runtime code now lives solely under `apps/cloud-laravel` and the active phase folder.
