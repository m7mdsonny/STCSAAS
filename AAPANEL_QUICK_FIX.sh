#!/bin/bash
# ============================================
# aaPanel Quick Fix Script
# Fixes Laravel API routing issue
# ============================================

set -e

echo "🔧 aaPanel Laravel API Routing Fix"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Find PHP socket
echo "🔍 Finding PHP socket..."
PHP_SOCKET=$(ls /tmp/php-cgi-*.sock 2>/dev/null | head -1)
if [ -z "$PHP_SOCKET" ]; then
    echo -e "${RED}PHP socket not found!${NC}"
    echo "Available sockets:"
    ls /tmp/php-cgi-*.sock 2>/dev/null || echo "None found"
    exit 1
fi

PHP_VERSION=$(echo $PHP_SOCKET | grep -oP 'php-cgi-\K[0-9]+')
echo -e "${GREEN}Found PHP socket: $PHP_SOCKET (PHP $PHP_VERSION)${NC}"
echo ""

# Backend config path
BACKEND_CONFIG="/www/server/panel/vhost/nginx/api.stcsolutions.online.conf"
BACKEND_ROOT="/www/wwwroot/api.stcsolutions.online/public"

# Frontend config path
FRONTEND_CONFIG="/www/server/panel/vhost/nginx/stcsolutions.online.conf"
FRONTEND_ROOT="/www/wwwroot/stcsolutions.online"

# Verify paths
echo "🔍 Verifying paths..."
if [ ! -f "$BACKEND_ROOT/index.php" ]; then
    echo -e "${RED}Backend index.php not found at: $BACKEND_ROOT${NC}"
    exit 1
fi

if [ ! -f "$FRONTEND_ROOT/index.html" ]; then
    echo -e "${YELLOW}Frontend index.html not found at: $FRONTEND_ROOT${NC}"
    echo "Make sure frontend is built: npm run build"
fi

echo -e "${GREEN}Paths verified${NC}"
echo ""

# Backup existing configs
echo "💾 Backing up existing configs..."
[ -f "$BACKEND_CONFIG" ] && cp "$BACKEND_CONFIG" "${BACKEND_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
[ -f "$FRONTEND_CONFIG" ] && cp "$FRONTEND_CONFIG" "${FRONTEND_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}Backups created${NC}"
echo ""

# Generate backend config
echo "📝 Generating backend config..."
cat > "$BACKEND_CONFIG" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name api.stcsolutions.online;
    
    root $BACKEND_ROOT;
    index index.php index.html index.htm;
    
    access_log /www/wwwlogs/api.stcsolutions.online.log;
    error_log /www/wwwlogs/api.stcsolutions.online.error.log;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php\$ {
        fastcgi_pass unix:$PHP_SOCKET;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }
    
    location ~ /\. {
        deny all;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.stcsolutions.online;
    
    ssl_certificate /www/server/panel/vhost/cert/api.stcsolutions.online/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/api.stcsolutions.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    root $BACKEND_ROOT;
    index index.php index.html index.htm;
    
    access_log /www/wwwlogs/api.stcsolutions.online.log;
    error_log /www/wwwlogs/api.stcsolutions.online.error.log;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php\$ {
        fastcgi_pass unix:$PHP_SOCKET;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF

echo -e "${GREEN}Backend config created${NC}"

# Generate frontend config
echo "📝 Generating frontend config..."
cat > "$FRONTEND_CONFIG" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name stcsolutions.online www.stcsolutions.online;
    
    root $FRONTEND_ROOT;
    index index.html index.htm;
    
    access_log /www/wwwlogs/stcsolutions.online.log;
    error_log /www/wwwlogs/stcsolutions.online.error.log;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stcsolutions.online www.stcsolutions.online;
    
    ssl_certificate /www/server/panel/vhost/cert/stcsolutions.online/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/stcsolutions.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    root $FRONTEND_ROOT;
    index index.html index.htm;
    
    access_log /www/wwwlogs/stcsolutions.online.log;
    error_log /www/wwwlogs/stcsolutions.online.error.log;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo -e "${GREEN}Frontend config created${NC}"
echo ""

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
else
    echo -e "${RED}Nginx configuration has errors!${NC}"
    nginx -t
    exit 1
fi
echo ""

# Reload Nginx
echo "🔄 Reloading Nginx..."
if systemctl reload nginx 2>/dev/null || /etc/init.d/nginx reload 2>/dev/null; then
    echo -e "${GREEN}Nginx reloaded successfully${NC}"
else
    echo -e "${YELLOW}Could not reload Nginx automatically${NC}"
    echo "Please reload manually: systemctl reload nginx"
fi
echo ""

# Test endpoints
echo "🧪 Testing endpoints..."
echo ""
echo "Testing Backend API:"
if curl -s https://api.stcsolutions.online/api/v1/public/landing | head -1 | grep -q "{"; then
    echo -e "${GREEN}✅ Backend API is working (returns JSON)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API test failed or returned HTML${NC}"
    echo "Response:"
    curl -s https://api.stcsolutions.online/api/v1/public/landing | head -5
fi
echo ""

echo "Testing Frontend:"
if curl -s https://stcsolutions.online | head -1 | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ Frontend is working (returns HTML)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend test failed${NC}"
fi
echo ""

echo "=================================="
echo -e "${GREEN}✅ Fix completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify both websites are separate in aaPanel"
echo "2. Check Document Roots in aaPanel:"
echo "   - Backend: $BACKEND_ROOT"
echo "   - Frontend: $FRONTEND_ROOT"
echo "3. Test your API endpoints"
echo ""

