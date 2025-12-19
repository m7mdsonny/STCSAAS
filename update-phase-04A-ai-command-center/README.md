# Phase 4A — AI Command Center (Patch Drop)

## Included files
- Backend
  - `apps/cloud-laravel/app/Http/Controllers/AiCommandController.php`
  - `apps/cloud-laravel/app/Models/AiCommand.php`
  - `apps/cloud-laravel/app/Models/AiCommandTarget.php`
  - `apps/cloud-laravel/app/Models/AiCommandLog.php`
  - `apps/cloud-laravel/routes/api.php`
  - `apps/cloud-laravel/database/migrations/2025_01_02_090000_create_ai_commands_tables.php`
- Web Portal
  - `apps/web-portal/src/lib/api/aiCommands.ts`
  - `apps/web-portal/src/lib/api/index.ts`
  - `apps/web-portal/src/types/database.ts`
  - `apps/web-portal/src/pages/admin/AiCommandCenter.tsx`
  - `apps/web-portal/src/App.tsx`

## Migrations
```bash
cd apps/cloud-laravel
php artisan migrate
```

## Routes
- `/api/v1/ai-commands` (GET list with filters, POST create)
- `/api/v1/ai-commands/{id}/ack` (edge ack)
- `/api/v1/ai-commands/{id}/retry` (super admin)
- `/api/v1/ai-commands/{id}/logs`

## Verification
1. Login as Super Admin → Admin → navigate to `/admin/ai-commands`.
2. Create a command (optionally pick an organization). It should appear in the queue list.
3. Call `POST /api/v1/ai-commands/{id}/ack` (or use curl) → status becomes `acknowledged` and log entry is added; UI reflects on refresh.
4. Retry sets status back to `queued` and adds a log entry.
