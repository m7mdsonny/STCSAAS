# Phase 3 — Platform Operations (Patch Drop)

## Included files
- Backend
  - `apps/cloud-laravel/app/Http/Controllers/SettingsController.php`
  - `apps/cloud-laravel/app/Http/Controllers/PublicContentController.php`
  - `apps/cloud-laravel/app/Http/Controllers/UpdateAnnouncementController.php`
  - `apps/cloud-laravel/app/Models/UpdateAnnouncement.php`
  - `apps/cloud-laravel/routes/api.php`
  - `apps/cloud-laravel/database/migrations/2025_01_01_130000_add_published_to_platform_contents.php`
  - `apps/cloud-laravel/database/migrations/2025_01_01_131000_create_updates_table.php`
- Web Portal
  - `apps/web-portal/src/lib/api/index.ts`
  - `apps/web-portal/src/lib/api/backups.ts`
  - `apps/web-portal/src/lib/api/updates.ts`
  - `apps/web-portal/src/pages/admin/AdminBackups.tsx`
  - `apps/web-portal/src/pages/admin/AdminUpdates.tsx`
  - `apps/web-portal/src/types/database.ts`
  - `apps/web-portal/src/App.tsx`

## Migrations
```bash
cd apps/cloud-laravel
php artisan migrate
```

## Routes added
- Public: `GET /api/v1/public/landing` (published landing content)
- Public: `GET /api/v1/public/updates` (published updates)
- Super Admin:
  - `GET/POST/PUT/DELETE /api/v1/updates`
  - `POST /api/v1/updates/{id}/toggle`

## Verification checklist
- **Landing:** edit/publish landing content via admin; `GET /api/v1/public/landing` returns published content.
- **Branding:** existing branding upload endpoints remain; refreshed logos apply on reload.
- **Updates:** create/publish/unpublish from Admin → Updates; public endpoint lists published records.
- **Backups:** Admin → Backups can "Backup now", list, download (link), and trigger restore (confirm prompt). Server handles actual restore.
- **Analytics foundation:** existing analytics endpoints remain; admin dashboard retains charts.

## Backup location & restore notes
- Backups use the backend `/backups` controller (server-side storage path as configured). Ensure aaPanel file permissions allow writing and downloading backups.
- Restore triggers server-side logic; confirm database access and ensure maintenance window before restoring.
