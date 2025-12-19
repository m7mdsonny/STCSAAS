# Phase 1A — Web Portal Token Auth Integration (Patch Drop)

## Summary
- Default API base: `https://stcsolutions.online/api/v1` with Bearer token on every request (env `VITE_API_URL` still supported).
- Auth bootstrap reads token/user from storage; login via API; logout clears token and redirects.
- Dashboard fetches and renders `/ai-policies/effective` for the signed-in organization.

## Copy paths
Apply these files over the existing project:
- `apps/web-portal/src/lib/apiClient.ts`
- `apps/web-portal/src/lib/api/auth.ts`
- `apps/web-portal/src/lib/api/index.ts`
- `apps/web-portal/src/lib/api/aiPolicies.ts`
- `apps/web-portal/src/contexts/AuthContext.tsx`
- `apps/web-portal/src/pages/Dashboard.tsx`

## Build steps
```bash
cd apps/web-portal
npm install
npm run build
```

## Verification steps
1. Open `/login`, sign in with a valid API user — confirm token stored in `localStorage` (`auth_token`, `auth_user`).
2. After login, the dashboard should load without refresh and show the "سياسة الذكاء الاصطناعي الفعالة" card. Network tab should show `GET /ai-policies/effective?organization_id=<id>` returning data.
3. Trigger logout from the UI — you should be redirected to `/login`, and local storage is cleared of auth entries.
4. Any 401 response should clear storage and redirect to `/login` automatically.

## aaPanel notes
- If serving via aaPanel, copy `apps/web-portal/dist/` build output into your web root (e.g., `/www/wwwroot/stcsolutions.online`) after building.
- Ensure the environment variable `VITE_API_URL` is set only if you need to override the default cloud URL.
