# دليل API - STC AI-VAP

## Base URL
```
https://api.stcsolutions.online/api/v1
```

---

## Authentication

### Login
```
POST /auth/login
Body: { "email": "...", "password": "..." }
Response: { "token": "...", "user": {...} }
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer {token}
```

### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

---

## Organizations

### List
```
GET /organizations
```

### Create
```
POST /organizations
Body: { "name": "...", ... }
```

### Update
```
PUT /organizations/{id}
```

### Delete
```
DELETE /organizations/{id}
```

---

## Users

### List
```
GET /users
```

### Create
```
POST /users
```

### Update
```
PUT /users/{id}
```

### Delete
```
DELETE /users/{id}
```

---

## Cameras

### List
```
GET /cameras
```

### Create
```
POST /cameras
```

### Update
```
PUT /cameras/{id}
```

### Delete
```
DELETE /cameras/{id}
```

### Get Stream URL
```
GET /cameras/{id}/stream
```

---

## Alerts

### List
```
GET /alerts
Query: ?page=1&per_page=20&status=new
```

### Get Alert
```
GET /alerts/{id}
```

### Acknowledge
```
POST /alerts/{id}/acknowledge
```

### Resolve
```
POST /alerts/{id}/resolve
```

---

## Edge Servers

### List
```
GET /edge-servers
```

### Heartbeat
```
POST /edges/heartbeat
Body: { "edge_id": "...", "version": "...", "system_info": {...} }
```

---

## Notifications

### Register Device
```
POST /notifications/register-device
Body: { "device_token": "...", "platform": "android" }
```

### Unregister Device
```
DELETE /notifications/unregister-device
Body: { "device_token": "..." }
```

---

## Analytics

### Get Stats
```
GET /analytics/stats
Query: ?start_date=...&end_date=...
```

---

**آخر تحديث**: 2024-12-20



