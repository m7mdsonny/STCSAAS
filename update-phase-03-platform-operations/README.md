# Phase 03 – Platform Operations & Branding

## Modified files
- `apps/cloud-laravel/app/Http/Controllers/SystemBackupController.php`
- `apps/cloud-laravel/app/Http/Controllers/UpdatePackageController.php`
- `apps/cloud-laravel/app/Models/UpdatePackage.php`
- `apps/cloud-laravel/database/migrations/2024_11_07_000000_create_update_packages_table.php`
- `apps/cloud-laravel/routes/api.php`
- `apps/web-portal/src/App.tsx`
- `apps/web-portal/src/lib/api/{analytics,backups,branding,content,updates,index}.ts`
- `apps/web-portal/src/lib/brandingTheme.ts`
- `apps/web-portal/src/pages/Landing.tsx`
- `apps/web-portal/src/pages/admin/{AdminDashboard,AdminSettings,LandingSettings}.tsx`
- `apps/web-portal/src/types/database.ts`

## Copy instructions
From repo root:
```bash
cp -R update-phase-03-platform-operations/apps/cloud-laravel/* apps/cloud-laravel/
cp -R update-phase-03-platform-operations/apps/web-portal/src/* apps/web-portal/src/
```

## Migrations
Apply the new update packages table:
```bash
php artisan migrate --force
```

## Frontend build (aaPanel-safe)
```bash
cd apps/web-portal
npm install
npm run build
cp -R dist/* ../cloud-laravel/public/portal/
```

## Verification checklist
- **Landing CMS**: Edit sections in **الإعدادات > صفحة الهبوط**; save pushes `/content` updates; public landing reads dynamic content and honors publish toggle.
- **Branding**: Update logos/colors in **الإعدادات > الهوية**; changes apply immediately across portal/login/landing without rebuild.
- **Updates distro**: Create/apply update packages in **الإعدادات > توزيع التحديثات**; APIs `/api/v1/updates` and `/api/v1/updates/latest` expose versioned payloads.
- **Backups**: From **الإعدادات > النسخ الاحتياطي** run “انشاء نسخة” (`POST /api/v1/backups`), download, and restore (`POST /api/v1/backups/{id}/restore` with confirm).
- **Analytics foundation**: Admin dashboard now pulls `/api/v1/analytics/summary` + `/api/v1/analytics/time-series` for real event metrics.
