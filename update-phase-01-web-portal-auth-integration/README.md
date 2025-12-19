# Phase 1 Patch: Web Portal Auth Integration (apps/web-portal)

## What changed
- Centralized API client now targets `https://stcsolutions.online/api/v1` by default, attaches Bearer tokens to every request, and clears storage/redirects on 401s.
- Auth context logout flow force-clears the token and routes users back to `/login`.
- Dashboard now performs a live call to `GET /api/v1/ai-policies/effective` after login and renders the returned policies with a manual refresh action and error states.
- Added `aiPolicies` API module for the effective policies endpoint.

## Copy paths
Copy each file from this patch folder into the repository at the matching path:
- `apps/web-portal/src/lib/apiClient.ts`
- `apps/web-portal/src/lib/api/aiPolicies.ts`
- `apps/web-portal/src/contexts/AuthContext.tsx`
- `apps/web-portal/src/pages/Dashboard.tsx`

## Build & deploy (aaPanel-safe)
1. From the repo root: `cd apps/web-portal && npm install && npm run build`
2. Copy the built assets to the Laravel public portal directory: `cp -r dist/* ../cloud-laravel/public/portal/`
3. Ensure Laravel deploy steps still run (for reference):
   - `cd ../cloud-laravel`
   - `composer install --no-dev`
   - `php artisan migrate --force`
   - `php artisan config:clear && php artisan route:clear`
4. Confirm `storage/` and `bootstrap/cache/` are writable on aaPanel.

## Verification checklist
- **Login page → POST /api/v1/auth/login:** enter valid credentials, submit, expect navigation to dashboard and token stored in localStorage under `auth_token`.
- **Dashboard → GET /api/v1/ai-policies/effective:** after login, the "سياسات الذكاء الاصطناعي الفعالة" card populates with live policy JSON; clicking "تحديث" refetches.
- **Protected routes:** refreshing on a protected page with a valid token keeps you authenticated; removing the token or receiving 401 clears it and redirects to `/login`.
- **Logout button:** click "تسجيل الخروج" in the sidebar → token cleared and browser redirected to `/login`.
