# RBAC Testing Guide - Sprint 2

## Manual Testing Steps

### Test 1: Role Display - Owner Shown Correctly

**Objective**: Verify Owner is never shown as Viewer

**Steps**:
1. Login as Organization Owner
2. Check Header component (top right)
   - Should display: "مالك" (Owner)
   - Should NOT display: "مشاهد" (Viewer)
3. Navigate to Team page
   - Check role badge next to your name
   - Should show "مالك" badge with gold color
4. Check profile dropdown (if exists)
   - Should show "مالك"

**Expected Result**: Owner role displayed correctly everywhere

**Acceptance**: ✅ Owner is never shown as Viewer

---

### Test 2: Super Admin Access

**Objective**: Verify Super Admin can access all resources

**Steps**:
1. Login as Super Admin
2. Navigate to `/admin/organizations`
   - Should see all organizations
3. Navigate to `/admin/users`
   - Should see all users from all organizations
4. Navigate to `/admin/edge-servers`
   - Should see all edge servers
5. Try to create an organization
   - Should succeed
6. Try to create a user for any organization
   - Should succeed

**Expected Result**: Full access to all resources

**Acceptance**: ✅ Super Admin can manage everything

---

### Test 3: Owner Access

**Objective**: Verify Owner can manage their organization

**Steps**:
1. Login as Organization Owner
2. Navigate to `/cameras`
   - Should see cameras from your organization only
3. Try to create a camera
   - Should succeed
4. Navigate to `/team`
   - Should see users from your organization only
5. Try to create a user
   - Should succeed
   - Cannot assign `super_admin` role
6. Navigate to `/edge-servers` (if exists)
   - Should see edge servers from your organization only
7. Try to access `/admin/organizations` directly
   - Should redirect to `/dashboard`

**Expected Result**: Full access to own organization, blocked from admin pages

**Acceptance**: ✅ Owner can manage own org, cannot access admin pages

---

### Test 4: Admin Access

**Objective**: Verify Admin has similar permissions to Owner

**Steps**:
1. Login as Organization Admin
2. Navigate to `/cameras`
   - Should see cameras from your organization
3. Try to create a camera
   - Should succeed
4. Navigate to `/team`
   - Should see users from your organization
5. Try to create a user
   - Should succeed
   - Cannot assign `super_admin` role
6. Try to access `/admin/organizations`
   - Should redirect to `/dashboard`

**Expected Result**: Similar to Owner, but role displayed as "مدير"

**Acceptance**: ✅ Admin can manage own org

---

### Test 5: Editor Access

**Objective**: Verify Editor can edit but not delete

**Steps**:
1. Login as Editor
2. Navigate to `/cameras`
   - Should see cameras from your organization
3. Try to create a camera
   - Should succeed
4. Try to update a camera
   - Should succeed
5. Try to delete a camera
   - Should fail with 403 or button disabled
6. Navigate to `/team`
   - Should NOT see Team page (if restricted) OR
   - Should see users but cannot manage them

**Expected Result**: Can edit/create, cannot delete/manage users

**Acceptance**: ✅ Editor has edit permissions, no delete permissions

---

### Test 6: Viewer Access

**Objective**: Verify Viewer has read-only access

**Steps**:
1. Login as Viewer
2. Navigate to `/cameras`
   - Should see cameras from your organization
3. Try to create a camera
   - Should fail with 403 or button disabled
4. Try to update a camera
   - Should fail with 403 or button disabled
5. Navigate to `/team`
   - Should NOT see Team page (if restricted)
6. Try to access `/admin/organizations`
   - Should redirect to `/dashboard`

**Expected Result**: Read-only access, no create/update/delete

**Acceptance**: ✅ Viewer has read-only access

---

### Test 7: Organization Scoping

**Objective**: Verify users can only see their organization's data

**Steps**:
1. Login as Owner of Organization A
2. Note the organization ID
3. Use browser dev tools to inspect API calls
4. Check `/api/v1/cameras` response
   - Should only contain cameras from Organization A
5. Try to manually call API with different organization_id
   ```bash
   GET /api/v1/cameras?organization_id=999
   Authorization: Bearer {owner_token}
   ```
   - Should return 403 or empty results
6. Login as Owner of Organization B
7. Check cameras
   - Should see different cameras (from Organization B)

**Expected Result**: Users only see their organization's data

**Acceptance**: ✅ Organization scoping works correctly

---

### Test 8: Navigation Visibility

**Objective**: Verify navigation shows correct items based on role

**Steps**:
1. Login as Super Admin
   - Check sidebar
   - Should see Admin menu items
   - Should NOT see organization menu items
2. Login as Owner
   - Check sidebar
   - Should see organization menu items
   - Should NOT see Admin menu items
   - Team link should be visible
3. Login as Viewer
   - Check sidebar
   - Should see organization menu items
   - Team link should NOT be visible (if restricted)

**Expected Result**: Navigation adapts to role

**Acceptance**: ✅ Navigation is role-aware

---

### Test 9: Direct URL Access

**Objective**: Verify users cannot access restricted pages via direct URL

**Steps**:
1. Login as Viewer
2. Manually navigate to `/admin/organizations`
   - Should redirect to `/dashboard`
3. Manually navigate to `/team`
   - Should redirect or show access denied (if restricted)
4. Login as Editor
5. Manually navigate to `/admin/organizations`
   - Should redirect to `/dashboard`

**Expected Result**: Restricted pages are blocked

**Acceptance**: ✅ Direct URL access is protected

---

### Test 10: Role Assignment

**Objective**: Verify role assignment rules

**Steps**:
1. Login as Super Admin
2. Create a user
   - Should be able to assign any role (including super_admin)
3. Login as Owner
4. Create a user
   - Should be able to assign: owner, admin, editor, viewer
   - Should NOT be able to assign: super_admin
5. Try to update a user's role to super_admin
   - Should fail with 403

**Expected Result**: Role assignment follows rules

**Acceptance**: ✅ Role assignment is enforced

---

## API Testing Examples

### Test: Super Admin Can Access All

```bash
# Get all organizations
curl -X GET "https://api.stcsolutions.online/api/v1/organizations" \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Accept: application/json"

# Expected: 200 OK, all organizations returned
```

### Test: Owner Can Only See Own Org's Cameras

```bash
# Get cameras (should only return owner's org)
curl -X GET "https://api.stcsolutions.online/api/v1/cameras" \
  -H "Authorization: Bearer {owner_token}" \
  -H "Accept: application/json"

# Expected: 200 OK, only cameras from owner's organization

# Try to access different org's cameras
curl -X GET "https://api.stcsolutions.online/api/v1/cameras?organization_id=999" \
  -H "Authorization: Bearer {owner_token}" \
  -H "Accept: application/json"

# Expected: 403 Forbidden OR empty results (only own org's cameras)
```

### Test: Editor Can Create But Not Delete

```bash
# Create camera (should succeed)
curl -X POST "https://api.stcsolutions.online/api/v1/cameras" \
  -H "Authorization: Bearer {editor_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "edge_server_id": 1,
    "rtsp_url": "rtsp://test.com/stream"
  }'

# Expected: 201 Created

# Delete camera (should fail)
curl -X DELETE "https://api.stcsolutions.online/api/v1/cameras/1" \
  -H "Authorization: Bearer {editor_token}"

# Expected: 403 Forbidden
```

### Test: Viewer Cannot Create

```bash
# Create camera (should fail)
curl -X POST "https://api.stcsolutions.online/api/v1/cameras" \
  -H "Authorization: Bearer {viewer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "edge_server_id": 1,
    "rtsp_url": "rtsp://test.com/stream"
  }'

# Expected: 403 Forbidden
```

### Test: Owner Cannot Access Admin Endpoints

```bash
# Try to create organization (should fail)
curl -X POST "https://api.stcsolutions.online/api/v1/organizations" \
  -H "Authorization: Bearer {owner_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Org",
    "subscription_plan": "basic"
  }'

# Expected: 403 Forbidden
```

## Verification Checklist

- [ ] Owner role displayed correctly (not as Viewer)
- [ ] Super Admin can access all resources
- [ ] Owner can manage own organization
- [ ] Admin can manage own organization
- [ ] Editor can edit but not delete
- [ ] Viewer has read-only access
- [ ] Organization scoping works (users only see own org)
- [ ] Navigation is role-aware
- [ ] Direct URL access is blocked
- [ ] Role assignment rules enforced
- [ ] All API endpoints return correct status codes
- [ ] Frontend shows correct error messages

## Common Issues & Solutions

### Issue: Owner still shown as Viewer
**Solution**: 
- Clear browser cache
- Check backend returns normalized role
- Verify frontend normalizes role on login
- Check Header component uses `getRoleLabel()`

### Issue: Can access other organization's data
**Solution**:
- Verify controller uses `ensureOrganizationAccess()`
- Check organization_id filtering in queries
- Test with different organization IDs

### Issue: Navigation shows wrong items
**Solution**:
- Check role normalization
- Verify Sidebar filtering logic
- Check role values match expected format

## Test Data Requirements

For comprehensive testing, you need:

1. **Super Admin User**
   - Email: `superadmin@demo.local`
   - Role: `super_admin`
   - No organization_id

2. **Organization Owner**
   - Email: `owner@org1.local`
   - Role: `owner`
   - organization_id: 1

3. **Organization Admin**
   - Email: `admin@org1.local`
   - Role: `admin`
   - organization_id: 1

4. **Editor**
   - Email: `editor@org1.local`
   - Role: `editor`
   - organization_id: 1

5. **Viewer**
   - Email: `viewer@org1.local`
   - Role: `viewer`
   - organization_id: 1

6. **Second Organization** (for scoping tests)
   - Organization ID: 2
   - With cameras, users, edge servers

## Success Criteria

✅ **Sprint 2 is complete when**:

1. Owner is NEVER shown as Viewer
2. All roles display correctly
3. Navigation is role-aware
4. API endpoints enforce RBAC
5. Organization scoping works
6. Direct URL access is blocked
7. Role assignment rules enforced
8. All tests pass



