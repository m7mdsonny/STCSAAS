# Phase 02 – Super Admin Core (Portal)

## What changed
- Wired super admin portal pages to live APIs for organizations, plans, licenses, SMS quotas, and notification priorities.
- Enforced bearer-token auth persistence and 401 handling while preserving super-admin-only access guards.
- Added real SMS quota awareness (plan-level and org-level) plus blocking of notification actions when quotas are exhausted.

## Copy instructions
From the repository root, copy the patch contents into place (paths are preserved):

```bash
cp -R update-phase-02-superadmin-core/apps/web-portal/src/* apps/web-portal/src/
```

## Build & deploy (aaPanel-safe)
1. Install dependencies (if not already):
   ```bash
   cd apps/web-portal
   npm install
   ```
2. Build the portal:
   ```bash
   npm run build
   ```
   The production build is emitted to `apps/web-portal/dist/`.
3. Deploy the build to the Laravel public portal path (current convention):
   ```bash
   cp -R dist/* ../cloud-laravel/public/portal/
   ```
4. Usual backend steps (unchanged): `composer install --no-dev`, `php artisan migrate --force`, `php artisan config:clear`, `php artisan route:clear`, ensure `storage/` and `bootstrap/cache/` are writable.

## Verification checklist
- **Login → Dashboard redirect**: Portal login (`/login`) calls `POST /api/v1/auth/login`, stores the bearer token, and redirects to `/admin` for super admins.
- **Organizations**: In **المؤسسات**, creating/editing/suspending uses `POST/PUT /api/v1/organizations`, `POST /api/v1/organizations/{id}/toggle-active`, and plan changes use `PUT /api/v1/organizations/{id}/plan`. SMS quota block updates call `PUT /api/v1/organizations/{id}/sms-quota`.
- **Plans**: In **الباقات**, creating/updating/toggling plans uses `POST/PUT /api/v1/subscription-plans` and persists SMS quota in `notification_channels`.
- **Licenses**: In **التراخيص**, create/edit/renew/regenerate actions call `POST/PUT /api/v1/licenses`, `POST /api/v1/licenses/{id}/renew`, and `POST /api/v1/licenses/{id}/regenerate-key`.
- **SMS Manager**: In **اعدادات الرسائل**, plan quotas use `PUT /api/v1/subscription-plans/{id}` and organization quotas use `GET/PUT /api/v1/organizations/{id}/sms-quota`. Exhausted quotas show warnings.
- **Notification Priority**: In **اعدادات اولوية الاشعارات**, adding/updating/removing priorities uses `GET/POST/PUT/DELETE /api/v1/notification-priorities` scoped by organization, and actions are disabled when the org SMS quota is consumed.
