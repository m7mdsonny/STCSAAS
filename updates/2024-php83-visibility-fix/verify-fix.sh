#!/bin/bash

# Verification script for PHP 8.3 visibility fix
# Run this on your server to check if UserController has the visibility issue

LARAVEL_PATH="/www/wwwroot/stcsolutions.online/backend/apps/cloud-laravel"
USER_CONTROLLER="${LARAVEL_PATH}/app/Http/Controllers/UserController.php"
BASE_CONTROLLER="${LARAVEL_PATH}/app/Http/Controllers/Controller.php"

echo "=========================================="
echo "PHP 8.3 Visibility Fix Verification"
echo "=========================================="
echo ""

# Check if files exist
if [ ! -f "$USER_CONTROLLER" ]; then
    echo "❌ ERROR: UserController.php not found at:"
    echo "   $USER_CONTROLLER"
    exit 1
fi

if [ ! -f "$BASE_CONTROLLER" ]; then
    echo "❌ ERROR: Controller.php not found at:"
    echo "   $BASE_CONTROLLER"
    exit 1
fi

echo "✅ Files found"
echo ""

# Check base Controller
echo "Checking base Controller..."
if grep -q "protected function ensureSuperAdmin" "$BASE_CONTROLLER"; then
    echo "✅ Base Controller has protected ensureSuperAdmin()"
else
    echo "❌ ERROR: Base Controller does not have protected ensureSuperAdmin()"
    exit 1
fi
echo ""

# Check UserController for override
echo "Checking UserController..."
if grep -q "function ensureSuperAdmin" "$USER_CONTROLLER"; then
    echo "⚠️  WARNING: UserController has an ensureSuperAdmin() override"
    echo ""
    
    # Check visibility
    if grep -q "public function ensureSuperAdmin" "$USER_CONTROLLER"; then
        echo "❌ ERROR: Method is PUBLIC - needs to be PROTECTED or removed"
        echo ""
        echo "Found at line(s):"
        grep -n "public function ensureSuperAdmin" "$USER_CONTROLLER"
        echo ""
        echo "Fix: Change 'public' to 'protected' or remove the entire method"
        exit 1
    elif grep -q "protected function ensureSuperAdmin" "$USER_CONTROLLER"; then
        echo "✅ Method is PROTECTED (correct)"
    else
        echo "⚠️  Method found but visibility unclear. Check manually:"
        grep -n "function ensureSuperAdmin" "$USER_CONTROLLER"
    fi
else
    echo "✅ No override found - UserController correctly inherits from parent"
fi
echo ""

# Test Laravel route:list
echo "Testing Laravel route discovery..."
cd "$LARAVEL_PATH" || exit 1

if php artisan route:list > /dev/null 2>&1; then
    echo "✅ php artisan route:list executes successfully"
    echo ""
    echo "Route count:"
    php artisan route:list 2>/dev/null | wc -l
else
    echo "❌ ERROR: php artisan route:list failed"
    echo ""
    echo "Error output:"
    php artisan route:list 2>&1 | head -10
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All checks passed!"
echo "=========================================="



