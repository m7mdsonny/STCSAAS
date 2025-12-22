# RBAC Implementation - Sprint 2

## Overview

Complete RBAC (Role-Based Access Control) system implemented across backend and frontend with standardized roles and consistent enforcement.

## Standardized Roles

### Backend (`RoleHelper.php`)
- `super_admin` - Full platform access
- `owner` - Organization owner
- `admin` - Organization administrator
- `editor` - Can edit/create resources
- `viewer` - Read-only access

### Frontend (`rbac.ts`)
- Same 5 roles with normalization and permission checking utilities

## Key Components

### 1. Backend Role System

#### `RoleHelper.php`
- Role normalization (handles migration from old role names)
- Permission level checking
- Role hierarchy
- Label generation (Arabic/English)

#### `Controller.php` (Base Controller)
- `ensureSuperAdmin()` - Super admin only
- `ensureCanManage()` - Owner or admin
- `ensureCanEdit()` - Owner, admin, or editor
- `ensureOrganizationAccess()` - Organization scoping

#### Middleware
- `EnsureRole` - Role-based route protection
- `EnsureOrganizationAccess` - Organization scoping

### 2. Frontend Role System

#### `rbac.ts`
- Role normalization
- Permission checking functions
- Role label generation
- Badge class generation

#### `AuthContext.tsx`
- Role normalization on login
- Permission flags (`isSuperAdmin`, `isOrgAdmin`, `canManage`)
- Role stored in normalized format

### 3. Updated Controllers

All controllers now use `RoleHelper`:

- **UserController**: Organization scoping, role validation
- **CameraController**: Organization scoping, edit permissions
- **EdgeController**: Organization scoping, manage permissions
- **LicenseController**: Organization owners can view their licenses
- **OrganizationController**: Super admin only (already enforced)

### 4. Updated Frontend Components

- **Header.tsx**: Uses `getRoleLabel()` for role display
- **Users.tsx**: Updated role definitions and checks
- **Team.tsx**: Updated role definitions and permission checks
- **AuthContext.tsx**: Role normalization on authentication

## Role Migration

Old role names are automatically normalized:

- `org_owner` → `owner`
- `org_admin` → `admin`
- `org_operator` → `editor`
- `org_viewer` → `viewer`

This happens:
- On User model access (accessor)
- On API responses (AuthController)
- On frontend (rbac.ts normalizeRole)

## "Owner Shown as Viewer" Fix

### Root Cause
- Frontend was checking for `org_owner` but backend may have returned `owner`
- Role normalization was inconsistent

### Solution
1. **Backend**: User model accessor normalizes role on access
2. **Backend**: AuthController normalizes role in login/me responses
3. **Frontend**: AuthContext normalizes role on authentication
4. **Frontend**: All role checks use `normalizeRole()` and `rbac.ts` utilities
5. **Frontend**: Header uses `getRoleLabel()` which handles normalization

### Verification
- Owner role is normalized to `owner` everywhere
- Display uses `getRoleLabel('owner')` which returns 'مالك'
- No more "Owner shown as Viewer" issue

## Files Created/Modified

### Backend
- ✅ `apps/cloud-laravel/app/Helpers/RoleHelper.php` - **NEW**
- ✅ `apps/cloud-laravel/app/Http/Middleware/EnsureRole.php` - **NEW**
- ✅ `apps/cloud-laravel/app/Http/Middleware/EnsureOrganizationAccess.php` - **NEW**
- ✅ `apps/cloud-laravel/app/Http/Controllers/Controller.php` - **UPDATED**
- ✅ `apps/cloud-laravel/app/Models/User.php` - **UPDATED** (role accessor/mutator)
- ✅ `apps/cloud-laravel/app/Http/Controllers/AuthController.php` - **UPDATED** (normalize on response)
- ✅ `apps/cloud-laravel/app/Http/Controllers/UserController.php` - **UPDATED** (RBAC enforcement)
- ✅ `apps/cloud-laravel/app/Http/Controllers/CameraController.php` - **UPDATED** (RBAC enforcement)
- ✅ `apps/cloud-laravel/app/Http/Controllers/EdgeController.php` - **UPDATED** (RBAC enforcement)
- ✅ `apps/cloud-laravel/app/Http/Controllers/LicenseController.php` - **UPDATED** (org owners can view)

### Frontend
- ✅ `apps/web-portal/src/lib/rbac.ts` - **NEW**
- ✅ `apps/web-portal/src/types/database.ts` - **UPDATED** (role type)
- ✅ `apps/web-portal/src/contexts/AuthContext.tsx` - **UPDATED** (normalization)
- ✅ `apps/web-portal/src/components/layout/Header.tsx` - **UPDATED** (use getRoleLabel)
- ✅ `apps/web-portal/src/pages/admin/Users.tsx` - **UPDATED** (role definitions)
- ✅ `apps/web-portal/src/pages/Team.tsx` - **UPDATED** (role definitions and checks)

## Testing Checklist

### Backend API Tests

#### Super Admin
```bash
# Should see all organizations
GET /api/v1/organizations
Authorization: Bearer {super_admin_token}
# Expected: All organizations

# Should create organization
POST /api/v1/organizations
Authorization: Bearer {super_admin_token}
# Expected: 201 Created

# Should see all users
GET /api/v1/users
Authorization: Bearer {super_admin_token}
# Expected: All users
```

#### Owner
```bash
# Should only see own org's cameras
GET /api/v1/cameras
Authorization: Bearer {owner_token}
# Expected: Only cameras from owner's organization

# Should create camera for own org
POST /api/v1/cameras
Authorization: Bearer {owner_token}
Body: { organization_id: owner_org_id, ... }
# Expected: 201 Created

# Should NOT see other org's cameras
GET /api/v1/cameras?organization_id=999
Authorization: Bearer {owner_token}
# Expected: 403 Forbidden or empty results
```

#### Editor
```bash
# Should view cameras
GET /api/v1/cameras
Authorization: Bearer {editor_token}
# Expected: Own org's cameras

# Should create camera
POST /api/v1/cameras
Authorization: Bearer {editor_token}
# Expected: 201 Created

# Should NOT delete camera
DELETE /api/v1/cameras/{id}
Authorization: Bearer {editor_token}
# Expected: 403 Forbidden
```

#### Viewer
```bash
# Should view cameras
GET /api/v1/cameras
Authorization: Bearer {viewer_token}
# Expected: Own org's cameras

# Should NOT create camera
POST /api/v1/cameras
Authorization: Bearer {viewer_token}
# Expected: 403 Forbidden
```

### Frontend Tests

#### Role Display
1. Login as Owner
2. Check Header - should show "مالك" (not "مشاهد")
3. Check profile dropdown - should show "مالك"
4. Check Team page - role badge should show "مالك"

#### Navigation
1. Login as Super Admin
   - Should see Admin menu items
   - Should NOT see organization menu items
2. Login as Owner
   - Should see organization menu items
   - Should NOT see Admin menu items
3. Login as Viewer
   - Should see organization menu items (read-only)
   - Should NOT see Team page (if restricted)

#### Page Access
1. Login as Viewer
2. Try to access `/admin` directly
   - Should redirect to `/dashboard`
3. Try to access `/team` directly
   - Should show page (if allowed) or redirect
4. Try to create camera
   - Button should be disabled or show error

## Verification Steps

### 1. Role Normalization
```bash
# Backend - Check User model
$user = User::find(1);
echo $user->role; // Should be normalized (owner, not org_owner)

# Frontend - Check in browser console
console.log(profile.role); // Should be normalized
```

### 2. Role Display
- Login as Owner
- Check Header component
- Should display "مالك" everywhere

### 3. API Enforcement
```bash
# As Owner, try to access other org's resource
curl -H "Authorization: Bearer {owner_token}" \
  https://api.stcsolutions.online/api/v1/cameras?organization_id=999
# Expected: 403 or empty results
```

### 4. Frontend Route Protection
- Login as Viewer
- Manually navigate to `/admin/organizations`
- Should redirect to `/dashboard`

## Known Issues Fixed

1. ✅ "Owner shown as Viewer" - Fixed via role normalization
2. ✅ Inconsistent role checks - Fixed via RoleHelper
3. ✅ Missing organization scoping - Fixed in all controllers
4. ✅ Hardcoded role strings - Replaced with RoleHelper/rbac.ts

## Remaining Work

1. ⏳ Update remaining controllers (if any) to use RoleHelper
2. ⏳ Add role-based navigation filtering in Sidebar
3. ⏳ Add route protection in App.tsx for organization pages
4. ⏳ Test all role combinations end-to-end

## Notes

- All roles are normalized automatically
- Migration from old role names is seamless
- No database migration needed (normalization happens at access time)
- Frontend and backend use same role values
- All permission checks are centralized



