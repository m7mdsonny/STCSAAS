# دليل Integration - STC AI-VAP

## Cloud ↔ Edge Server

### Heartbeat
```
POST /api/v1/edges/heartbeat
{
  "edge_id": "edge_123",
  "version": "2.0.0",
  "system_info": {...}
}
```

### Camera Sync
```
POST /api/v1/cameras
{
  "name": "Camera 1",
  "rtsp_url": "rtsp://...",
  "edge_server_id": 1
}
```

### AI Commands
```
POST /api/v1/ai-commands/execute
{
  "command_type": "face_recognition",
  "camera_id": 1,
  "module": "face_recognition"
}
```

---

## Cloud ↔ Mobile App

### Authentication
```
POST /api/v1/auth/login
```

### Alerts
```
GET /api/v1/alerts
```

### Cameras
```
GET /api/v1/cameras
```

### Notifications
```
POST /api/v1/notifications/register-device
```

---

## Cloud ↔ Web Portal

### Authentication
```
POST /api/v1/auth/login
```

### All CRUD Operations
- Organizations
- Users
- Cameras
- Alerts
- Analytics
- Settings

---

**آخر تحديث**: 2024-12-20



