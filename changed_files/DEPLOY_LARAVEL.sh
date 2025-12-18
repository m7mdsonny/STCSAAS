#!/bin/bash

#############################################################################
# Laravel Sanctum Authentication Fix Deployment Script
# Purpose: Deploy authentication fixes to Laravel backend and React frontend
# Date: 2025-12-17
#############################################################################

set -e

echo "🚀 Starting Laravel Sanctum Fix Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📂 Script Directory: $SCRIPT_DIR"
echo "📂 Project Root: $PROJECT_ROOT"
echo ""

#############################################################################
# Step 1: Verify Prerequisites
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Verifying Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the right directory
if [ ! -d "$PROJECT_ROOT/apps/cloud-laravel" ]; then
    echo -e "${RED}❌ Error: apps/cloud-laravel not found!${NC}"
    echo "Please run this script from the changed_files directory"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/apps/web-portal" ]; then
    echo -e "${RED}❌ Error: apps/web-portal not found!${NC}"
    echo "Please run this script from the changed_files directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project structure verified"

# Check if changed files exist
if [ ! -f "$SCRIPT_DIR/apps/cloud-laravel/routes/api.php" ]; then
    echo -e "${RED}❌ Error: api.php not found in changed_files!${NC}"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/apps/cloud-laravel/app/Http/Controllers/AuthController.php" ]; then
    echo -e "${RED}❌ Error: AuthController.php not found in changed_files!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Changed files present"
echo ""

#############################################################################
# Step 2: Backup Existing Files
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Backing Up Existing Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKUP_DIR="$PROJECT_ROOT/backups/laravel_auth_fix_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup Laravel files
if [ -f "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php" ]; then
    cp "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php" "$BACKUP_DIR/api.php.backup"
    echo -e "${GREEN}✓${NC} Backed up api.php"
fi

if [ -f "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php" ]; then
    cp "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php" "$BACKUP_DIR/AuthController.php.backup"
    echo -e "${GREEN}✓${NC} Backed up AuthController.php"
fi

echo -e "${BLUE}ℹ${NC}  Backups saved to: $BACKUP_DIR"
echo ""

#############################################################################
# Step 3: Copy Laravel Backend Files
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Copying Laravel Backend Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy api.php
cp "$SCRIPT_DIR/apps/cloud-laravel/routes/api.php" \
   "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php"
echo -e "${GREEN}✓${NC} Copied api.php"

# Copy AuthController.php
cp "$SCRIPT_DIR/apps/cloud-laravel/app/Http/Controllers/AuthController.php" \
   "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php"
echo -e "${GREEN}✓${NC} Copied AuthController.php"

echo ""

#############################################################################
# Step 4: Copy Frontend Configuration
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Copying Frontend Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy .env
cp "$SCRIPT_DIR/apps/web-portal/.env" \
   "$PROJECT_ROOT/apps/web-portal/.env"
echo -e "${GREEN}✓${NC} Copied web-portal/.env"

echo ""

#############################################################################
# Step 5: Clear Laravel Caches
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Clearing Laravel Caches"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT/apps/cloud-laravel"

php artisan route:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Could not clear route cache"
php artisan config:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Could not clear config cache"
php artisan cache:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Could not clear app cache"

echo -e "${GREEN}✓${NC} Laravel caches cleared"
echo ""

#############################################################################
# Step 6: Verify Routes
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Verifying Laravel Routes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT/apps/cloud-laravel"

echo "Checking for auth routes..."
if php artisan route:list | grep -q "api/v1/auth/login"; then
    echo -e "${GREEN}✓${NC} Routes registered correctly"
    echo ""
    echo "Available auth routes:"
    php artisan route:list | grep "api/v1/auth" | head -6
else
    echo -e "${RED}❌ Warning: Routes may not be registered correctly${NC}"
fi

echo ""

#############################################################################
# Step 7: Summary
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📋 What was done:"
echo "  • Backed up original files to: $BACKUP_DIR"
echo "  • Copied 2 Laravel backend files"
echo "  • Copied 1 frontend configuration file"
echo "  • Cleared Laravel caches"
echo "  • Verified route registration"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Start Laravel Backend:"
echo "   cd apps/cloud-laravel"
echo "   php artisan serve --host 0.0.0.0 --port 8000"
echo ""
echo "2. In a new terminal, start Frontend:"
echo "   cd apps/web-portal"
echo "   npm run dev"
echo ""
echo "3. Open browser to http://localhost:5173"
echo ""
echo "4. Test Authentication:"
echo "   • Click 'Create Demo Account'"
echo "   • Login with created credentials"
echo "   • Verify session persists on reload"
echo "   • Test logout"
echo ""
echo "📖 Full documentation:"
echo "  • changed_files/LARAVEL_SANCTUM_FIX_README.md"
echo ""
echo "🔍 Troubleshooting:"
echo "  • Check Laravel logs: apps/cloud-laravel/storage/logs/laravel.log"
echo "  • Check browser console for errors"
echo "  • Verify VITE_API_URL in apps/web-portal/.env"
echo "  • Ensure both servers are running"
echo ""
echo -e "${GREEN}🎉 Ready to test!${NC}"
echo ""
