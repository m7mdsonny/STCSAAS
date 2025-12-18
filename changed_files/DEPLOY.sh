#!/bin/bash

##############################################################################
# AI-VAP Login Fix - Deployment Script
# This script applies all necessary fixes for HTTP 500 login error
##############################################################################

set -e  # Exit on error

echo "======================================"
echo "AI-VAP Login Fix - Deployment"
echo "======================================"
echo ""

# Detect Laravel directory
if [ -d "apps/cloud-laravel" ]; then
    LARAVEL_DIR="apps/cloud-laravel"
elif [ -d "../apps/cloud-laravel" ]; then
    LARAVEL_DIR="../apps/cloud-laravel"
elif [ -d "./cloud-laravel" ]; then
    LARAVEL_DIR="./cloud-laravel"
else
    echo "❌ Error: Cannot find Laravel directory (apps/cloud-laravel)"
    echo "Please run this script from the project root or changed_files directory"
    exit 1
fi

echo "📂 Laravel directory: $LARAVEL_DIR"
echo ""

# Step 1: Copy Base Controller
echo "Step 1: Creating base Controller..."
mkdir -p "$LARAVEL_DIR/app/Http/Controllers"
cp -f app/Http/Controllers/Controller.php "$LARAVEL_DIR/app/Http/Controllers/Controller.php"
echo "✅ Controller.php created"
echo ""

# Step 2: Update .env file
echo "Step 2: Updating .env configuration..."
if [ -f "$LARAVEL_DIR/.env" ]; then
    # Backup original .env
    cp "$LARAVEL_DIR/.env" "$LARAVEL_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"

    # Update cache and session drivers
    sed -i 's/^CACHE_STORE=database/CACHE_STORE=file/' "$LARAVEL_DIR/.env"
    sed -i 's/^SESSION_DRIVER=database/SESSION_DRIVER=file/' "$LARAVEL_DIR/.env"

    echo "✅ .env updated (CACHE_STORE=file, SESSION_DRIVER=file)"
else
    echo "⚠️  Warning: .env file not found, copying .env.example"
    cp .env.example "$LARAVEL_DIR/.env"
    echo "⚠️  IMPORTANT: Update DB credentials in .env file!"
fi
echo ""

# Step 3: Update .env.example
echo "Step 3: Updating .env.example..."
cp -f .env.example "$LARAVEL_DIR/.env.example"
echo "✅ .env.example updated"
echo ""

# Step 4: Set up storage directories
echo "Step 4: Setting up storage directories..."
mkdir -p "$LARAVEL_DIR/storage/framework/sessions"
mkdir -p "$LARAVEL_DIR/storage/framework/cache/data"
mkdir -p "$LARAVEL_DIR/storage/framework/views"
mkdir -p "$LARAVEL_DIR/storage/logs"
echo "✅ Storage directories created"
echo ""

# Step 5: Set permissions
echo "Step 5: Setting storage permissions..."
# Detect web server user
WEB_USER="www-data"
if id "www" &>/dev/null; then
    WEB_USER="www"
fi

if [ "$EUID" -eq 0 ]; then
    # Running as root, can change ownership
    chown -R "$WEB_USER:$WEB_USER" "$LARAVEL_DIR/storage"
    chmod -R 775 "$LARAVEL_DIR/storage"
    echo "✅ Permissions set (owner: $WEB_USER)"
else
    # Not root, just set permissions
    chmod -R 775 "$LARAVEL_DIR/storage"
    echo "✅ Permissions set (chmod 775)"
    echo "⚠️  Note: Run with sudo to set ownership to $WEB_USER"
fi
echo ""

# Step 6: Clear caches
echo "Step 6: Clearing Laravel caches..."
cd "$LARAVEL_DIR"
php artisan cache:clear 2>/dev/null || echo "⚠️  Cache clear skipped"
php artisan config:clear 2>/dev/null || echo "⚠️  Config clear skipped"
php artisan route:clear 2>/dev/null || echo "⚠️  Route clear skipped"
echo "✅ Caches cleared"
echo ""

# Step 7: Check PHP extensions
echo "Step 7: Checking PHP extensions..."
if php -m | grep -q "pdo_pgsql"; then
    echo "✅ pdo_pgsql extension is installed"
else
    echo "⚠️  WARNING: pdo_pgsql extension NOT found"
    echo "   Database operations may fail. Install via:"
    echo "   - aaPanel: Software Store → PHP 8.2 → Install Extensions → pdo_pgsql"
fi
echo ""

# Summary
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Restart PHP-FPM:"
echo "   systemctl restart php-fpm-82"
echo ""
echo "2. Test login:"
echo "   curl -X POST https://stcsolutions.online/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@example.com\",\"password\":\"Admin@12345\"}'"
echo ""
echo "3. Check logs if issues persist:"
echo "   tail -f $LARAVEL_DIR/storage/logs/laravel.log"
echo ""
echo "======================================"
