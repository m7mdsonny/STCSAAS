# aaPanel Deployment — Phase 06 (Update-Only)

This guide assumes the platform is already deployed on aaPanel with a valid `.env` and populated database. The steps below cover
update-only rollouts (no fresh install) and verification after the Phase 06 stabilization review.

## Pre-Deployment Checklist
- Confirm `.env` is present and correct (database, queues, mail, storage drivers).
- Ensure a recent backup exists via `/api/v1/backups` before applying updates.
- Stop any ongoing queue jobs or long-running workers only if needed to prevent race conditions during restore.

## Code Update Steps
1. **Pull latest code or replace changed files**
   - Upload or sync the updated repository snapshot to the server.
   - Ensure file ownership matches the web user (e.g., `www-data`).
2. **Install/update PHP dependencies (if composer.lock changed)**
   ```bash
   cd /path/to/project/apps/cloud-laravel
   composer install --no-dev --optimize-autoloader
   ```
3. **Front-end dependencies (if web portal assets changed)**
   ```bash
   cd /path/to/project/apps/web-portal
   npm ci
   npm run build
   ```
   Deploy the built assets according to your existing process (e.g., serve via nginx/static hosting).

## Post-Update Laravel Commands
Run from `apps/cloud-laravel`:
```bash
php artisan optimize:clear
php artisan migrate --force
php artisan queue:restart
php artisan storage:link
```
- **Cache clearing**: `optimize:clear` resets config/route/view caches to pick up updated settings.
- **Migrations**: No new migrations were added in Phase 06, but running migrations ensures schema consistency without data loss.
- **Queue restart**: Restarts workers to load any updated code paths.
- **Storage link**: Re-creates the public storage symlink if needed for backup downloads.

## File Permissions
Ensure web server and queue users can read/write storage and cache directories:
```bash
chown -R www-data:www-data /path/to/project
find /path/to/project/apps/cloud-laravel/storage -type d -exec chmod 775 {} +
find /path/to/project/apps/cloud-laravel/bootstrap/cache -type d -exec chmod 775 {} +
```

## Verification Checklist
Perform these checks after deployment (use a super-admin token where required):
1. **Login**: API `/api/v1/auth/login` and web portal sign-in both return valid tokens; inactive users are blocked.
2. **Backups**: Create a backup (`POST /api/v1/backups`), list it, download via `/api/v1/backups/{id}/download`, and restore to
   confirm data rollback.
3. **Platform Updates**: Create/update/publish via `/api/v1/updates` and confirm visibility in `/api/v1/public/updates`.
4. **Edge Events**: Submit an event through `/api/v1/edge/events` and verify severity/camera validation with correct org scoping.
5. **AI Commands**: Dispatch a command through the UI or API and verify queue processing and acknowledgments in logs/DB.
6. **Logs**: Tail Laravel logs to confirm no authentication or backup errors:
   ```bash
   tail -f storage/logs/laravel.log
   ```

## Database Safety
- No destructive migrations were introduced in Phase 06.
- Always run a backup before deployment and confirm restore ability with the latest archive.
- If a schema change is needed later, use idempotent migrations or supply a tested SQL dump with explicit restore steps.

