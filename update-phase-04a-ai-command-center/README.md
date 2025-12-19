# Phase 4A – AI Command Center (Core)

## Copy paths
From repo root:
```
cp -R update-phase-04a-ai-command-center/apps/cloud-laravel/* apps/cloud-laravel/
cp -R update-phase-04a-ai-command-center/apps/web-portal/src/* apps/web-portal/src/
```

## Build & deploy (aaPanel-safe)
1) Backend
```
cd apps/cloud-laravel
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear && php artisan route:clear && php artisan cache:clear
```
2) Frontend
```
cd apps/web-portal
npm install
npm run build
cp -R dist/* ../cloud-laravel/public/portal/
```

## Verification
- Login as Super Admin.
- Navigate to **الإعدادات > اوامر الذكاء** (sidebar “اوامر الذكاء”).
- Create a command (title + command type + payload JSON).
- Command appears in the queue with status “pending”.
- Click **Ack** to simulate edge acknowledgment; status changes to “acknowledged” and log is recorded.

## Notes
- New tables: `ai_commands`, `ai_command_targets`, `ai_command_logs`.
- API endpoints:
  - `GET /api/v1/ai-commands`
  - `POST /api/v1/ai-commands`
  - `POST /api/v1/ai-commands/{id}/status`
  - `POST /api/v1/ai-commands/{id}/ack`
- All endpoints require Bearer token (Sanctum) and Super Admin.
