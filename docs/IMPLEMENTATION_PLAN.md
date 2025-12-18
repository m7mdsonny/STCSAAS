# STC AI-VAP Implementation Plan

## Overview

This document outlines the complete implementation plan for restructuring the STC AI-VAP system to follow strict responsibility separation with Laravel as the single source of truth for the cloud backend.

---

## STEP 0.5: Project Restructuring & Cleanup (MANDATORY)

### Target Project Structure

```
/apps
  /cloud-laravel        → Laravel SaaS backend (ONLY cloud logic)
  /edge-server          → Local Edge Server (FastAPI, AI, hardware)
  /web-portal           → React frontend (API client only)
  /mobile-app           → Flutter app (Cloud API client)

/docs
  IMPLEMENTATION_PLAN.md
  FEATURE_PARITY.md
  API_CONTRACTS.md
  INSTALLER_FLOW.md
  WHAT_TO_DELETE.md
  FINAL_VERIFICATION_CHECKLIST.md

/scripts
  full_stack_check.sh
  package.sh
```

### Files/Folders to DELETE

| Path | Reason | Replacement |
|------|--------|-------------|
| `/cloud-server/` | Duplicate of `/apps/cloud-server/` | Use `/apps/cloud-laravel/` |
| `/edge-server/` | Duplicate (empty) | Use `/apps/edge-server/` |
| `/apps/cloud-server/` | Python FastAPI cloud - replaced by Laravel | `/apps/cloud-laravel/` |
| `/apps/README (1).md` | Malformed filename | Clean up |
| `/.bolt/` | Build tool config - not needed | None |
| `/apps/web-portal/supabase/` | Supabase migrations & functions | Laravel migrations |
| `/apps/web-portal/src/lib/supabase.ts` | Direct Supabase client | `apiClient.ts` |

### Cleanup Strategy

1. **Document before delete** - All files listed in WHAT_TO_DELETE.md
2. **Verify no feature loss** - Cross-check with FEATURE_PARITY.md
3. **Remove duplicates first** - Root-level cloud-server, edge-server
4. **Remove legacy code** - Python cloud-server, Supabase functions
5. **Clean up filenames** - Remove spaces and special characters

---

## STEP 1: Laravel Database Schema & API Contracts

### Database Tables (22 Tables)

| Table | Purpose |
|-------|---------|
| users | User accounts with role (super_admin, admin, operator, viewer) |
| organizations | Multi-tenant organizations |
| licenses | License keys with module entitlements |
| subscription_plans | Plan definitions (free, basic, pro, enterprise) |
| edge_servers | Registered edge devices |
| cameras | RTSP camera configurations |
| alerts | AI-generated alerts |
| events | Generic event log |
| registered_faces | Face recognition database |
| registered_vehicles | License plate database |
| attendance_records | Check-in/out records |
| vehicle_access_logs | Gate/parking access logs |
| automation_rules | Trigger-action rules |
| automation_logs | Rule execution history |
| integrations | Hardware integrations (GPIO, Modbus, etc.) |
| notification_settings | Per-user notification preferences |
| notification_logs | Delivery history |
| alert_priorities | Module/severity -> channel mapping |
| audience_stats | Demographics analytics |
| landing_settings | Public landing page config |
| resellers | White-label reseller accounts |
| audit_logs | System audit trail |

### API Versioning

All endpoints follow: `/api/v1/{resource}`

### Authentication

**Laravel Sanctum** (chosen over JWT):
- Native Laravel integration
- SPA + mobile token support
- Session handling for web
- No external dependencies

---

## STEP 2: Responsibility Separation

### Cloud (Laravel) - ALLOWED

| Responsibility | Details |
|----------------|---------|
| REST APIs | All CRUD operations |
| Database | Single source of truth |
| Authentication | Sanctum tokens |
| Subscriptions | Plan enforcement |
| Licenses | Generation, validation |
| AI Configuration | Module settings, reference images |
| Integration Profiles | GPIO/Modbus/MQTT configs |
| Alerts & Dashboards | Aggregation, reporting |
| Web Installer | CodeCanyon-style wizard |

### Cloud (Laravel) - FORBIDDEN

| Not Allowed | Reason |
|-------------|--------|
| AI inference | Runs on Edge only |
| Video processing | Never leaves Edge |
| Hardware drivers | Edge-only |
| Direct GPIO | Edge-only |

### Edge Server (FastAPI) - ALLOWED

| Responsibility | Details |
|----------------|---------|
| AI Execution | 9 modules locally |
| Video Processing | RTSP streams |
| Local Database | SQLite cache |
| Hardware Control | GPIO, serial, Modbus |
| Offline Operation | Queue events for sync |
| Event Generation | Create alerts/events |

### Edge Server (FastAPI) - FORBIDDEN

| Not Allowed | Reason |
|-------------|--------|
| Subscription source | Cloud-only |
| User management | Cloud-only |
| License generation | Cloud-only |

### Web Portal (React) - ALLOWED

| Responsibility | Details |
|----------------|---------|
| UI Rendering | All pages/components |
| API Client | Call Laravel endpoints |
| Auth Flow | Via Laravel Sanctum |
| State Management | React hooks/context |

### Web Portal (React) - FORBIDDEN

| Not Allowed | Reason |
|-------------|--------|
| Direct DB access | Must use Laravel APIs |
| Supabase client | Removed |
| Business logic | Cloud-only |
| AI processing | Edge-only |

### Mobile App (Flutter) - ALLOWED

| Responsibility | Details |
|----------------|---------|
| UI Rendering | Screens/widgets |
| API Client | Call Laravel endpoints |
| Push Notifications | FCM handling |
| Subscription-aware UI | Show/hide by entitlement |

### Mobile App (Flutter) - FORBIDDEN

| Not Allowed | Reason |
|-------------|--------|
| Direct DB access | Must use Laravel APIs |
| Supabase client | Removed |
| AI logic | Edge-only |
| Hardware control | Edge-only |

---

## STEP 3: Flutter Mobile App Re-binding

### Current State (Using Supabase)

```dart
// lib/core/services/supabase_service.dart
final supabase = Supabase.instance.client;
await supabase.auth.signInWithPassword(...);
```

### Target State (Using Laravel)

```dart
// lib/core/services/api_service.dart
class ApiService {
  final String baseUrl = AppConfig.apiUrl;
  String? _token;

  Future<AuthResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/auth/login'),
      body: jsonEncode({'email': email, 'password': password}),
    );
    // ...
  }
}
```

### Files to Update

| File | Changes |
|------|---------|
| `lib/main.dart` | Remove Supabase.initialize() |
| `lib/core/services/supabase_service.dart` | DELETE - replace with api_service.dart |
| `lib/core/services/api_service.dart` | Update endpoints to /api/v1/* |
| `lib/core/services/auth_service.dart` | Use Laravel auth |
| `lib/config/env.dart` | Update API_URL |
| `lib/data/repositories/*.dart` | Use ApiService instead of Supabase |
| `pubspec.yaml` | Remove supabase_flutter dependency |

### New API Endpoints for Mobile

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/logout` | POST | Logout |
| `/api/v1/auth/me` | GET | Current user |
| `/api/v1/alerts` | GET | List alerts |
| `/api/v1/cameras` | GET | List cameras |
| `/api/v1/edge-servers` | GET | List edge servers |
| `/api/v1/dashboard` | GET | Dashboard stats |
| `/api/v1/notifications/settings` | GET/PUT | Notification preferences |

---

## STEP 4: Subscription Enforcement

### Enforcement Points

| Layer | Enforcement |
|-------|-------------|
| Laravel API | Check entitlements before operations |
| Edge Server | Validate license before AI execution |
| Web Portal | Hide/disable UI based on plan |
| Mobile App | Show/hide features by entitlement |

### Module Entitlements

```php
// Laravel License Model
public function hasModule(string $module): bool
{
    return in_array($module, $this->modules ?? []);
}
```

```python
# Edge Server
async def check_module_entitlement(self, license_id: str, module: str) -> bool:
    success, data = await self._request(
        "GET", f"/api/v1/edge/entitlement/{module}",
        params={"license_id": license_id}
    )
    return success and data.get("entitled", False)
```

```typescript
// Web Portal
const canUseModule = (module: string) => {
  return user?.organization?.license?.modules?.includes(module);
};
```

### Plan Limits

| Plan | Edge Servers | Cameras | Integrations |
|------|--------------|---------|--------------|
| Free | 1 | 2 | 0 |
| Basic | 2 | 8 | 2 |
| Pro | 5 | 25 | 10 |
| Enterprise | Unlimited | Unlimited | Unlimited |

---

## STEP 5: Web Installer

### Flow

```
/install → Requirements → Permissions → Database → Admin → Complete
```

### Requirements Check

- PHP >= 8.2
- Required extensions: pdo_pgsql, openssl, mbstring, tokenizer, xml, ctype, json, bcmath
- Composer installed
- Node.js >= 18 (for assets)

### Installer Lock

After successful installation:
1. Create `storage/installed.lock`
2. Redirect /install to /login
3. Remove installer routes in production

---

## STEP 6: Execution Order

| Phase | Task | Status |
|-------|------|--------|
| 0.5 | Project restructuring & cleanup | PENDING |
| 1 | Laravel DB schema + API contracts | DONE |
| 2 | Laravel APIs + auth + migrations | DONE |
| 3 | React portal API services | DONE |
| 4 | Edge to Cloud communication | DONE |
| 5 | Web installer | DONE |
| 6 | Flutter re-binding | PENDING |
| 7 | Final cleanup & verification | PENDING |

---

## STEP 7: Final Verification Checklist

| Requirement | Verification Method |
|-------------|---------------------|
| Web portal has zero Supabase usage | `grep -r "supabase" src/` returns nothing |
| Laravel is only DB owner | All queries through Eloquent |
| 9 modules preserved | Check license.modules array |
| Edge sends events only | No video/frames to cloud |
| Installer works | Complete wizard end-to-end |
| Subscription gates work | Test with different plans |
| Flutter aligned | No API errors on mobile |
| No orphaned files | Clean directory structure |

---

## Appendix: 9 AI Modules

| ID | Name | Arabic |
|----|------|--------|
| fire | Fire Detection | كشف الحريق والدخان |
| face | Face Recognition | التعرف على الوجوه |
| counter | People Counter | عد الاشخاص |
| vehicle | Vehicle Recognition | التعرف على المركبات |
| attendance | Attendance | تسجيل الحضور |
| warehouse | Warehouse Monitoring | مراقبة المستودعات |
| productivity | Productivity | مراقبة الانتاجية |
| audience | Audience Analytics | تحليل الجمهور |
| intrusion | Intrusion Detection | كشف التسلل |

---

## Appendix: Integration Types

| Type | Protocol |
|------|----------|
| arduino | Serial/USB |
| raspberry_gpio | GPIO pins |
| modbus_tcp | Modbus TCP/IP |
| http_rest | HTTP webhooks |
| mqtt | MQTT broker |
| tcp_socket | Raw TCP |
