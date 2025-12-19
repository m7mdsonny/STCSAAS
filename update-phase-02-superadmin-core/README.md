# Phase 2 — Super Admin Core Management (Patch Drop)

## Included paths
- `apps/cloud-laravel/app/Http/Controllers/OrganizationController.php`
- `apps/cloud-laravel/app/Http/Controllers/SubscriptionPlanController.php`
- `apps/cloud-laravel/app/Http/Controllers/LicenseController.php`
- `apps/cloud-laravel/app/Http/Controllers/SmsQuotaController.php`
- `apps/cloud-laravel/app/Models/SubscriptionPlan.php`
- `apps/cloud-laravel/app/Models/Organization.php`
- `apps/cloud-laravel/routes/api.php`
- `apps/cloud-laravel/database/migrations/2025_01_01_120000_add_sms_quota_to_subscription_plans.php`
- `apps/web-portal/src/lib/api/index.ts`
- `apps/web-portal/src/lib/api/notifications.ts`
- `apps/web-portal/src/lib/api/smsQuota.ts`
- `apps/web-portal/src/pages/admin/AdminNotifications.tsx`
- `apps/web-portal/src/pages/admin/AdminSmsSettings.tsx`
- `apps/web-portal/src/pages/admin/Organizations.tsx`
- `apps/web-portal/src/types/database.ts`

## Backend
1. **Migration:** add `sms_quota` to `subscription_plans`
   ```bash
   cd apps/cloud-laravel
   php artisan migrate
   ```
2. **Routes:** `/organizations/{id}/sms-quota/consume` added for hard-limit enforcement.
3. **Super Admin enforcement:** Organizations, plans, licenses, SMS quota updates are restricted via `ensureSuperAdmin`.
4. **Plan defaults:** assigning a plan updates org limits and SMS quota record; org creation seeds SMS quota from plan.

## Web Portal
1. **API wiring:**
   - Default super-admin SMS quota service (`smsQuotaApi`) + notification priority CRUD on `/notification-priorities`.
   - Index exports updated.
2. **Super Admin pages:**
   - **Organizations:** plan dropdown populated from subscription plans.
   - **Admin SMS Settings:** uses real SMS settings + org quotas, allows limit edits and consume checks (disabled at limit) with visual progress.
   - **Admin Notifications:** real notification priority CRUD per organization.

## Build
```bash
cd apps/web-portal
npm install
npm run build
```

## Verification (DoD)
- Login as Super Admin, navigate to Admin → Organizations: create/edit org, toggle active, assign plan (reflects limits).
- Admin → SMS Settings: update provider keys; per-org quota shows used/limit; "ارسال تجريبي" consumes quota until blocked at limit.
- Admin → Notifications: select organization, add/update/delete notification priority (persists via API).
- Laravel migration applied; `/api/v1/organizations/{id}/sms-quota/consume` returns 429 when exceeding quota.
