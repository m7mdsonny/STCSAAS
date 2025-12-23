# دليل النشر - STC AI-VAP

## Cloud API (Production)

### 1. Server Setup
```bash
# Ubuntu 22.04
sudo apt update
sudo apt install nginx php8.3-fpm postgresql
```

### 2. Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.stcsolutions.online;
    root /var/www/stcai/cloud-laravel/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

### 3. Environment
```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.stcsolutions.online
```

### 4. Permissions
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## Web Portal (Production)

### 1. Build
```bash
npm run build
```

### 2. Deploy
```bash
# نسخ dist/ إلى Nginx
cp -r dist/* /var/www/stcai/web/
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name stcsolutions.online;
    root /var/www/stcai/web;
    
    location / {
        try_files $uri /index.html;
    }
}
```

---

## Mobile App (Production)

### 1. Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### 2. iOS
```bash
flutter build ios --release
```

---

## Edge Server (Production)

### 1. Windows EXE
```bash
python -m PyInstaller edge_server.spec
```

### 2. Linux Service
```bash
sudo systemctl enable stc-edge
sudo systemctl start stc-edge
```

---

**آخر تحديث**: 2024-12-20



