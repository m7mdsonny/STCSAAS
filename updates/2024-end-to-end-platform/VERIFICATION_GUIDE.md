# Verification Guide - End-to-End Platform Implementation

## Quick Start Testing

### 1. Camera CRUD Testing

#### Prerequisites
- Logged in as Organization Owner or Super Admin
- At least one Edge Server exists for the organization

#### Test Create Camera
```bash
POST /api/v1/cameras
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Test Camera 1",
  "edge_server_id": 1,
  "rtsp_url": "rtsp://example.com/stream",
  "location": "Main Entrance",
  "username": "admin",
  "password": "password123",
  "resolution": "1920x1080",
  "fps": 15,
  "enabled_modules": ["face_detection", "object_detection"]
}
```

**Expected:**
- Status: 201 Created
- Response includes camera with encrypted password in config
- Camera visible in list

#### Test List Cameras
```bash
GET /api/v1/cameras?per_page=10
Authorization: Bearer {token}
```

**Expected:**
- Returns paginated list
- Organization Owner sees only their org's cameras
- Super Admin can filter by `organization_id`

#### Test Update Camera
```bash
PUT /api/v1/cameras/{camera_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Camera Name",
  "status": "online",
  "fps": 30
}
```

**Expected:**
- Status: 200 OK
- Camera updated with new values
- Config JSONB updated correctly

#### Test Delete Camera
```bash
DELETE /api/v1/cameras/{camera_id}
Authorization: Bearer {token}
```

**Expected:**
- Status: 200 OK
- Camera soft-deleted
- No longer appears in list

#### Test Ownership Enforcement
```bash
# As Organization Owner, try to access another org's camera
GET /api/v1/cameras/{other_org_camera_id}
Authorization: Bearer {owner_token}
```

**Expected:**
- Status: 403 Forbidden
- Error message: "Unauthorized"

### 2. Firebase/FCM Testing

#### Prerequisites
- Logged in as Super Admin
- FCM server key available

#### Test Save FCM Settings
```bash
PUT /api/v1/super-admin/settings
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "fcm_settings": {
    "server_key": "YOUR_FCM_SERVER_KEY",
    "project_id": "optional-project-id"
  }
}
```

**Expected:**
- Status: 200 OK
- Settings saved

#### Test FCM Push Notification
```bash
POST /api/v1/super-admin/test-fcm
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "test_token": "optional-device-token"
}
```

**Expected:**
- Status: 200 OK
- Response: `{"success": true, "message": "Test notification sent successfully"}`
- Notification received on device (if token provided)
- Logs show FCM API call

#### Test FCM Without Configuration
```bash
POST /api/v1/super-admin/test-fcm
Authorization: Bearer {super_admin_token}
```

**Expected (if not configured):**
- Status: 422 Unprocessable Entity
- Error: "FCM server key is missing"

### 3. Frontend Integration Testing

#### Camera Page
1. Navigate to Cameras page as Organization Owner
2. Click "Add Camera"
3. Fill form:
   - Name: "Test Camera"
   - Edge Server: Select from dropdown
   - RTSP URL: "rtsp://test.com/stream"
   - Location: "Test Location"
   - Username/Password: Optional
   - Resolution: "1920x1080"
   - FPS: 15
   - Enabled Modules: Select modules
4. Click "Save"
5. Verify camera appears in list
6. Click camera to edit
7. Update name and save
8. Verify changes persist
9. Delete camera
10. Verify removed from list

#### Firebase Settings Page
1. Navigate to Super Admin → Firebase Settings
2. Enter FCM Server Key
3. Click "Save"
4. Click "Test Push Notification"
5. Verify success message
6. Check device for notification (if token configured)

## Common Issues & Solutions

### Issue: Camera creation fails with "Edge server does not belong to your organization"
**Solution:** Ensure the selected edge server belongs to your organization. Super Admin can assign edge servers to organizations.

### Issue: Cannot see cameras after creation
**Solution:** 
- Check organization_id matches your user's organization
- Verify edge_server_id is correct
- Check API response for errors

### Issue: FCM test fails
**Solution:**
- Verify server key is correct
- Check FCM project settings
- Ensure legacy API is enabled (if using legacy)
- Check Laravel logs for detailed error

### Issue: Password not encrypted
**Solution:** 
- Verify Laravel encryption key is set in `.env`
- Run `php artisan key:generate` if needed
- Check `config/app.php` encryption settings

## Database Verification

### Check Camera Created
```sql
SELECT id, name, organization_id, edge_server_id, status, config 
FROM cameras 
WHERE name = 'Test Camera';
```

### Check Config JSONB
```sql
SELECT config->>'username' as username,
       config->>'resolution' as resolution,
       config->>'fps' as fps,
       config->'enabled_modules' as modules
FROM cameras 
WHERE id = 1;
```

### Check FCM Settings
```sql
SELECT fcm_settings 
FROM system_settings 
LIMIT 1;
```

## API Response Examples

### Camera List Response
```json
{
  "data": [
    {
      "id": 1,
      "organization_id": 1,
      "edge_server_id": 1,
      "name": "Test Camera",
      "camera_id": "cam_abc123",
      "rtsp_url": "rtsp://example.com/stream",
      "location": "Main Entrance",
      "status": "offline",
      "username": "admin",
      "password_encrypted": "***",
      "resolution": "1920x1080",
      "fps": 15,
      "enabled_modules": ["face_detection"],
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 1
}
```

### FCM Test Success Response
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "response": {
    "multicast_id": 123456789,
    "success": 1,
    "failure": 0,
    "canonical_ids": 0,
    "results": [
      {
        "message_id": "0:1234567890"
      }
    ]
  }
}
```

## Next Steps After Verification

1. ✅ Camera CRUD working
2. ✅ Firebase test working
3. ⏳ Test frontend integration
4. ⏳ Fix loading states
5. ⏳ Implement Cloud↔Edge integration
6. ⏳ Complete remaining features



