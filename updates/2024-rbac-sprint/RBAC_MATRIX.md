# RBAC Matrix - Role-Based Access Control

## Standard Roles

The platform supports exactly 5 roles:

1. **super_admin** - Full platform access
2. **owner** - Organization owner (full org access)
3. **admin** - Organization administrator (full org access)
4. **editor** - Can edit/create resources
5. **viewer** - Read-only access

## Role Hierarchy

```
super_admin (Level 5)
    ↓
owner (Level 4)
    ↓
admin (Level 3)
    ↓
editor (Level 2)
    ↓
viewer (Level 1)
```

## Permission Matrix

### Organizations

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update All | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Own | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Toggle Active | ✅ | ❌ | ❌ | ❌ | ❌ |

### Users

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ✅* | ✅* | ❌ | ❌ |
| Create Super Admin | ✅ | ❌ | ❌ | ❌ | ❌ |

*Cannot assign super_admin role

### Edge Servers

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Bind License | ✅ | ✅ | ✅ | ❌ | ❌ |

### Licenses

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Activate/Suspend | ✅ | ❌ | ❌ | ❌ | ❌ |

### Cameras

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create (Own Org) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update (Own Org) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Get Snapshot | ✅ | ✅ | ✅ | ✅ | ✅ |

### AI Commands

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Templates | ✅ | ❌ | ❌ | ❌ | ❌ |
| Execute (Own Org) | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Results | ✅ | ✅ | ✅ | ✅ | ✅ |

### Integrations

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete (Own Org) | ✅ | ✅ | ✅ | ❌ | ❌ |

### Finance

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| View All | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ❌ | ❌ |

### Settings

| Action | super_admin | owner | admin | editor | viewer |
|--------|-------------|-------|-------|--------|--------|
| Platform Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Organization Settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| User Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notification Settings | ✅ | ✅ | ✅ | ✅ | ❌ |

## Organization Scoping Rules

1. **Super Admin**: Can access all organizations
2. **Owner/Admin/Editor/Viewer**: Can only access their own organization
3. **No Organization**: Users without organization_id cannot access organization-scoped resources

## Role Assignment Rules

1. **Super Admin** can assign any role to any user
2. **Owner/Admin** can assign roles to users in their organization, but:
   - Cannot assign `super_admin` role
   - Cannot assign roles to users outside their organization
3. **Editor/Viewer** cannot assign roles

## Navigation Visibility

### Super Admin Navigation
- Admin Dashboard
- System Monitor
- Organizations
- Users (All)
- Edge Servers (All)
- Licenses (All)
- Resellers
- Plans
- AI Modules
- Integrations
- SMS Settings
- Landing Page
- Branding
- Settings
- Super Admin Management
- Updates
- Backups

### Organization Navigation (Owner/Admin/Editor/Viewer)
- Dashboard
- Live View
- Cameras
- Alerts
- Analytics
- People
- Vehicles
- Attendance
- Automation
- Team
- Settings

**Note**: Some menu items may be hidden based on permissions (e.g., Team page only visible to Owner/Admin).

## API Endpoint Protection

All API endpoints enforce RBAC:

- **Super Admin Only**: `/api/v1/super-admin/*`, `/api/v1/organizations/*` (create/update/delete)
- **Organization Scoped**: `/api/v1/cameras/*`, `/api/v1/edge-servers/*`, `/api/v1/licenses/*` (view own org)
- **Role-Based**: Create/Update/Delete operations check role permissions

## Implementation Notes

- Roles are normalized on backend (User model accessor)
- Roles are normalized on frontend (rbac.ts utilities)
- Old role names (`org_owner`, `org_admin`, etc.) are automatically migrated
- All role checks use `RoleHelper` (backend) or `rbac.ts` (frontend)
- No hardcoded role strings in controllers or components



