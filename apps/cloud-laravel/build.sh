#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
WEB_PORTAL_DIR="$PROJECT_ROOT/apps/web-portal"
LARAVEL_PUBLIC="$SCRIPT_DIR/public"

echo "========================================"
echo "AI-VAP Platform Build Script"
echo "========================================"

if [ ! -d "$WEB_PORTAL_DIR" ]; then
    echo "Error: Web portal directory not found at $WEB_PORTAL_DIR"
    exit 1
fi

echo ""
echo "[1/4] Installing web portal dependencies..."
cd "$WEB_PORTAL_DIR"
npm install

echo ""
echo "[2/4] Building React application..."
npm run build

echo ""
echo "[3/4] Copying build assets to Laravel public directory..."

if [ -f "$LARAVEL_PUBLIC/index.html" ]; then
    rm -f "$LARAVEL_PUBLIC/index.html"
fi
if [ -d "$LARAVEL_PUBLIC/assets" ]; then
    rm -rf "$LARAVEL_PUBLIC/assets"
fi

cp "$WEB_PORTAL_DIR/dist/index.html" "$LARAVEL_PUBLIC/"
cp -r "$WEB_PORTAL_DIR/dist/assets" "$LARAVEL_PUBLIC/"

if [ -d "$WEB_PORTAL_DIR/dist/public" ]; then
    cp -r "$WEB_PORTAL_DIR/dist/public/"* "$LARAVEL_PUBLIC/" 2>/dev/null || true
fi

echo ""
echo "[4/4] Setting permissions..."
cd "$SCRIPT_DIR"

if [ -d "storage" ]; then
    chmod -R 775 storage
fi
if [ -d "bootstrap/cache" ]; then
    chmod -R 775 bootstrap/cache
fi

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "========================================"
echo ""
echo "Files deployed to: $LARAVEL_PUBLIC"
echo ""
echo "Next steps:"
echo "  1. Run 'composer install' in cloud-laravel directory"
echo "  2. Copy .env.example to .env and configure"
echo "  3. Run 'php artisan key:generate'"
echo "  4. Run 'php artisan serve' to test locally"
echo ""
echo "For aaPanel deployment:"
echo "  - Set document root to: $LARAVEL_PUBLIC"
echo "  - Configure PHP 8.2+"
echo "  - Set up database connection in .env"
echo ""
