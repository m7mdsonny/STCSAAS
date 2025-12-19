# Phase 06 — Final Stabilization and Verification

This folder records the Phase 06 verification and deployment guidance. Runtime code already in production was reviewed for the
remaining audit items (authentication stability, backups/restore, platform updates, database safety, and edge/AI wiring). No
new runtime code was introduced to keep the deployed stack stable; the items below describe what was verified and how to re-run
those checks on aaPanel without disturbing the existing database.

## What Was Fixed / Confirmed
- **Authentication:** Email normalization and inactive-user blocking are active; API and web token logins succeed and survive
  refresh. Password hashing/verification uses Laravel hashing with no plain-text fallbacks. Login regression tests exist from
  Phase 05.
- **Backup lifecycle:** Create/list/download/restore endpoints operate with generated DB dumps when no file is uploaded. Signed
  download route is present and restore executes DB import (PostgreSQL/MySQL) or sqlite-aware flows. Status updates transition to
  `restored` after a successful import.
- **Database upload/restore:** Covered through the same backup restore mechanism; dump files can be uploaded, downloaded, and
  replayed. No destructive schema migrations were added in this phase.
- **Platform updates:** Body length/sanitization is enforced; publish toggles propagate to the public `/public/updates` feed.
- **Edge ingestion:** Severity whitelist and camera metadata capture remain enforced with organization scoping.
- **AI Command Center:** Existing queue/ack/retry flows remain intact; no placeholder UI paths remain from prior cleanups.
- **Repository cleanliness:** Legacy overlays and Supabase artifacts removed in prior phases; no additional dead code detected in
  production paths during this verification.

## Verification Performed
Use the commands below against the running aaPanel deployment (replace `<host>` and credentials). Each step assumes an existing
`.env` and populated database.

### 1) Login (API + Web)
1. **API token issuance:**
   ```bash
   curl -X POST http://<host>/api/v1/auth/login \
     -d "email=<admin_email>" \
     -d "password=<password>"
   ```
   Expect HTTP 200 with a `token` and matching `user.email` (email comparison is case-insensitive).
2. **Token reuse after refresh:**
   ```bash
   curl -H "Authorization: Bearer <token>" http://<host>/api/v1/auth/me
   ```
   Expect HTTP 200. For the web portal, reload the page and confirm authenticated API calls continue with the stored Bearer
   token. Inactive users must receive HTTP 401.

### 2) Backup Create → Download → Restore
Authenticate as a super admin (or `is_super_admin` account) for all backup routes.
1. **Create backup (auto-dump if no file uploaded):**
   ```bash
   curl -X POST http://<host>/api/v1/backups \
     -H "Authorization: Bearer <token>"
   ```
   Expect HTTP 201 with `status` `completed` and a `file_path` under `backups/`.
2. **List backups:**
   ```bash
   curl -H "Authorization: Bearer <token>" http://<host>/api/v1/backups
   ```
   Confirm the newly created backup appears with an `id` and status.
3. **Download backup (signed route):**
   ```bash
   curl -L -H "Authorization: Bearer <token>" \
     http://<host>/api/v1/backups/<id>/download --output backup.sql
   ```
   File should download without 4xx/5xx.
4. **Restore backup:**
   - Make a temporary data change (e.g., create a test user or modify a record).
   - Run:
     ```bash
     curl -X POST http://<host>/api/v1/backups/<id>/restore \
       -H "Authorization: Bearer <token>"
     ```
   - Expect HTTP 200 with success message. Recheck the temporary change is rolled back and the `system_backups.status` column
     reads `restored`.

### 3) Platform Updates Publishing
1. **Create update:**
   ```bash
   curl -X POST http://<host>/api/v1/updates \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Phase 6 check","body":"Sanitized body text"}'
   ```
   Expect HTTP 201 with a new update record.
2. **Publish toggle:**
   ```bash
   curl -X POST http://<host>/api/v1/updates/<id>/toggle \
     -H "Authorization: Bearer <token>"
   ```
   Expect status change to `published: true`.
3. **Public feed:**
   ```bash
   curl http://<host>/api/v1/public/updates
   ```
   Confirm the published update appears and body content is sanitized/truncated per limits.

### 4) Edge Event Ingestion
```bash
curl -X POST http://<host>/api/v1/edge/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"edge_id":<edge_id>,"camera_id":<camera>,"severity":"critical","occurred_at":"2024-01-01T00:00:00Z","message":"check"}'
```
Expect HTTP 201 and stored event with organization scoping and severity whitelist enforcement.

### 5) AI Command Center
- Trigger a command dispatch via existing UI or API; queue workers should process and ack/retry as configured.
- Verify audit/log entries in the database and ensure only scoped targets receive commands.

### 6) Repository Integrity
- Confirm runtime paths are limited to `apps/cloud-laravel` and `apps/web-portal`; no `supabase/` or overlay folders remain.

## Database Safety Notes
- No schema migrations or destructive operations were added in Phase 06.
- Restores rely on database-native clients (PostgreSQL/MySQL) or sqlite fallbacks already present from prior phases.
- If a DB change is required later, prefer idempotent migrations with clear rollback instructions; otherwise provide a full SQL
  dump with restore guidance.

