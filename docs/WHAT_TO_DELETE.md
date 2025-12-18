# What to Delete - Complete File Inventory

This document lists ALL files and folders that must be removed as part of the Laravel migration and project cleanup.

---

## Overview

Per the execution contract requirements:
- Cloud = Laravel ONLY (Single Source of Truth)
- Web Portal = Pure Frontend (calls Laravel APIs only)
- Edge Server = Local AI execution (sends only events/alerts to Laravel)

---

## SECTION 1: Duplicate/Orphan Folders at Root Level

These folders exist at the project root but are duplicates of content in `/apps/`:

| Path | Reason | Replacement | Status |
|------|--------|-------------|--------|
| `/cloud-server/` | Duplicate Python FastAPI | `/apps/cloud-laravel/` | **DELETE** |
| `/edge-server/` | Empty duplicate folder | `/apps/edge-server/` | **DELETE** |
| `/.bolt/` | Build tool config - not needed | None | **DELETE** |

---

## SECTION 2: Legacy Python Cloud Server

The entire `/apps/cloud-server/` directory must be removed - Laravel is the single source of truth.

| Path | Reason | Replacement |
|------|--------|-------------|
| `/apps/cloud-server/` | Python FastAPI replaced by Laravel | `/apps/cloud-laravel/` |
| `/apps/cloud-server/main.py` | FastAPI entry point | Laravel routes/api.php |
| `/apps/cloud-server/requirements.txt` | Python deps | composer.json |
| `/apps/cloud-server/database.sql` | Legacy schema | Laravel migrations |
| `/apps/cloud-server/.env.example` | Python env | Laravel .env |
| `/apps/cloud-server/README.md` | Legacy docs | Laravel README |
| `/apps/cloud-server/app/api/__init__.py` | Package init | - |
| `/apps/cloud-server/app/api/config.py` | Config API | Laravel ConfigController |
| `/apps/cloud-server/app/api/edges.py` | Edge API | Laravel EdgeController |
| `/apps/cloud-server/app/api/events.py` | Events API | Laravel EventController |
| `/apps/cloud-server/app/api/licensing.py` | License API | Laravel LicenseController |
| `/apps/cloud-server/app/api/management.py` | Management API | Laravel AdminController |
| `/apps/cloud-server/app/db/__init__.py` | Package init | - |
| `/apps/cloud-server/app/db/database.py` | DB layer | Eloquent |
| `/apps/cloud-server/app/db/seed_data.py` | Seeder | Laravel DatabaseSeeder |
| `/apps/cloud-server/app/models/__init__.py` | Package init | - |
| `/apps/cloud-server/app/models/core.py` | Data models | Eloquent models |
| `/apps/cloud-server/app/schemas/__init__.py` | Package init | - |
| `/apps/cloud-server/app/schemas/core.py` | Pydantic schemas | Laravel Form Requests |

---

## SECTION 3: Supabase Files (Web Portal)

All direct Supabase usage must be removed from the web portal.

### Files to Delete

| Path | Reason | Replacement |
|------|--------|-------------|
| `/apps/web-portal/src/lib/supabase.ts` | Direct Supabase client | `apiClient.ts` |
| `/apps/web-portal/supabase/` | Entire Supabase directory | Laravel migrations |

### Supabase Functions (Delete Entire Directory)

| Directory | Reason | Replacement |
|-----------|--------|-------------|
| `supabase/functions/admin-create-user/` | Edge function | Laravel UserController |
| `supabase/functions/create-test-users/` | Edge function | Laravel seeder |
| `supabase/functions/edge-api/` | Edge function | Laravel EdgeApiController |
| `supabase/functions/edge-webhook/` | Edge function | Laravel webhook route |
| `supabase/functions/send-notification/` | Edge function | Laravel NotificationController |

### Supabase Migrations (Delete All)

| Files | Reason |
|-------|--------|
| `supabase/migrations/*.sql` | All 17 migration files | Laravel migrations |

---

## SECTION 4: Malformed Files

| Path | Reason | Action |
|------|--------|--------|
| `/apps/README (1).md` | Malformed filename (space + parenthesis) | **DELETE** |

---

## SECTION 5: Dependencies to Remove

### Web Portal (package.json)
```json
// REMOVE this dependency:
"@supabase/supabase-js": "^2.x.x"
```

### Mobile App (pubspec.yaml)
```yaml
# REMOVE this dependency:
supabase_flutter: ^2.x.x
```

---

## SECTION 6: Mobile App Supabase Files

| Path | Reason | Replacement |
|------|--------|-------------|
| `/apps/mobile-app/lib/core/services/supabase_service.dart` | Supabase client | `api_service.dart` |

---

## SECTION 7: Files to MIGRATE (Update, Not Delete)

These files contain Supabase imports that must be replaced with API services:

### Contexts
| File | Supabase Usage | API Replacement |
|------|----------------|-----------------|
| `src/contexts/AuthContext.tsx` | `supabase.auth.*` | `authApi.*` |

### Main Pages
| File | Supabase Usage | API Replacement |
|------|----------------|-----------------|
| `src/pages/Login.tsx` | `supabase.auth.signInWithPassword` | `authApi.login` |
| `src/pages/Dashboard.tsx` | `supabase.from()` | `dashboardApi` |
| `src/pages/Alerts.tsx` | `supabase.from('alerts')` | `alertsApi` |
| `src/pages/Cameras.tsx` | `supabase.from('cameras')` | `camerasApi` |
| `src/pages/People.tsx` | `supabase.from('registered_faces')` | `peopleApi` |
| `src/pages/Vehicles.tsx` | `supabase.from('registered_vehicles')` | `vehiclesApi` |
| `src/pages/Attendance.tsx` | `supabase.from('attendance_records')` | `attendanceApi` |
| `src/pages/Analytics.tsx` | `supabase.from('audience_stats')` | `analyticsApi` |
| `src/pages/Automation.tsx` | `supabase.from('automation_rules')` | `automationRulesApi` |
| `src/pages/Settings.tsx` | `supabase.from()` | `settingsApi` |
| `src/pages/Team.tsx` | `supabase.from('users')` | `usersApi` |
| `src/pages/Landing.tsx` | `supabase.from('landing_settings')` | `settingsApi` |
| `src/pages/LiveView.tsx` | `supabase.from('edge_servers')` | `edgeServersApi` |

### Admin Pages
| File | Supabase Usage | API Replacement |
|------|----------------|-----------------|
| `src/pages/admin/AdminDashboard.tsx` | `supabase.from()` | `dashboardApi` |
| `src/pages/admin/AdminIntegrations.tsx` | `supabase.from('integrations')` | `integrationsApi` |
| `src/pages/admin/AdminSmsSettings.tsx` | `supabase.from()` | `settingsApi` |
| `src/pages/admin/EdgeServers.tsx` | `supabase.from('edge_servers')` | `edgeServersApi` |
| `src/pages/admin/LandingSettings.tsx` | `supabase.from('landing_settings')` | `settingsApi` |
| `src/pages/admin/Licenses.tsx` | `supabase.from('licenses')` | `licensesApi` |
| `src/pages/admin/Organizations.tsx` | `supabase.from('organizations')` | `organizationsApi` |
| `src/pages/admin/Plans.tsx` | `supabase.from('subscription_plans')` | `settingsApi` |
| `src/pages/admin/Resellers.tsx` | `supabase.from('resellers')` | `settingsApi` |
| `src/pages/admin/SystemMonitor.tsx` | `supabase.from()` | `dashboardApi` |
| `src/pages/admin/Users.tsx` | `supabase.from('users')` | `usersApi` |

### Components
| File | Supabase Usage | API Replacement |
|------|----------------|-----------------|
| `src/components/ui/EdgeServerMonitor.tsx` | `supabase.from()` | `edgeServersApi` |
| `src/components/ui/EdgeServerStatus.tsx` | `supabase.from()` | `edgeServersApi` |
| `src/components/layout/Header.tsx` | `supabase.auth` | `authApi` |
| `src/components/settings/AlertPrioritySettings.tsx` | `supabase.from()` | `notificationsApi` |
| `src/components/settings/NotificationSettings.tsx` | `supabase.from()` | `notificationsApi` |
| `src/components/settings/OrganizationSettings.tsx` | `supabase.from()` | `organizationsApi` |
| `src/components/settings/SecuritySettings.tsx` | `supabase.auth` | `authApi` |

### Other Libraries
| File | Supabase Usage | API Replacement |
|------|----------------|-----------------|
| `src/lib/edgeServer.ts` | `supabase.from()` | `edgeServersApi` |

---

## SECTION 8: Environment Variables

### Web Portal (.env) - REMOVE
```
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
```

### Web Portal (.env) - ADD
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Mobile App (env.dart) - REMOVE
```dart
static const supabaseUrl = 'xxx';
static const supabaseAnonKey = 'xxx';
```

### Mobile App (env.dart) - ADD
```dart
static const apiUrl = 'http://localhost:8000/api/v1';
```

---

## SECTION 9: Cleanup Commands

Execute in this order:

```bash
# Step 1: Remove duplicate root-level folders
rm -rf cloud-server
rm -rf edge-server
rm -rf .bolt

# Step 2: Remove legacy Python cloud server
rm -rf apps/cloud-server

# Step 3: Remove malformed README
rm "apps/README (1).md"

# Step 4: Remove Supabase directory from web portal
rm -rf apps/web-portal/supabase

# Step 5: Remove Supabase client file
rm apps/web-portal/src/lib/supabase.ts

# Step 6: Remove Supabase service from mobile app
rm apps/mobile-app/lib/core/services/supabase_service.dart
```

---

## SECTION 10: Summary

| Category | Count | Action |
|----------|-------|--------|
| Duplicate root folders | 3 | DELETE |
| Legacy Python cloud | ~20 files | DELETE |
| Supabase files (web) | ~25 files | DELETE |
| Malformed files | 1 | DELETE |
| Mobile Supabase | 1 | DELETE |
| **Total to DELETE** | **~50 files** | - |
| Pages to UPDATE | 13 | UPDATE |
| Admin pages to UPDATE | 11 | UPDATE |
| Components to UPDATE | 7 | UPDATE |
| Other files to UPDATE | 2 | UPDATE |
| **Total to UPDATE** | **~33 files** | - |

---

## SECTION 11: Verification After Cleanup

```bash
# 1. Verify no Supabase references in web portal
grep -r "supabase" apps/web-portal/src --include="*.ts" --include="*.tsx"
# Expected: No matches

# 2. Verify no Supabase references in mobile app
grep -r "supabase" apps/mobile-app/lib --include="*.dart"
# Expected: No matches

# 3. Verify clean root directory
ls -la
# Expected: apps/, docs/, scripts/, package.json, README.md, .env

# 4. Verify apps structure
ls apps/
# Expected: cloud-laravel/, edge-server/, web-portal/, mobile-app/

# 5. Verify no legacy Python cloud
ls apps/cloud-server 2>/dev/null && echo "ERROR: cloud-server still exists" || echo "OK"
# Expected: OK
```

---

## IMPORTANT NOTES

1. **DO NOT delete blindly** - This document serves as the audit trail
2. **Verify feature parity** - All functionality preserved in Laravel APIs
3. **Test after each deletion** - Run `npm run build` to verify no breaks
4. **Use git** - Commit before deletions for easy rollback
5. **Update imports** - After deleting files, fix all broken imports
6. **Mobile rebuild** - After changes, rebuild Flutter app to verify
