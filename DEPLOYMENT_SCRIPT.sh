#!/bin/bash

# ============================================
# STC AI-VAP Platform - Deployment Script
# CyberPanel Deployment Automation
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/home/stcsolutions.online/public_html"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
REPO_URL="https://github.com/m7mdsonny/STCSAAS.git"
TEMP_DIR="/tmp/stc_deploy_$(date +%s)"

# Functions
print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Step 1: Backup .env file
backup_env() {
    print_step "المرحلة 1: عمل نسخة احتياطية من ملف .env"
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        BACKUP_FILE="$BACKEND_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$BACKEND_DIR/.env" "$BACKUP_FILE"
        print_success "تم عمل نسخة احتياطية: $BACKUP_FILE"
    else
        print_warning "ملف .env غير موجود - سيتم إنشاؤه من .env.example"
    fi
}

# Step 2: Clone/Update Repository
clone_repo() {
    print_step "المرحلة 2: استنساخ/تحديث المشروع من GitHub"
    
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    if [ -d "STCSAAS" ]; then
        cd STCSAAS
        git pull
        print_success "تم تحديث المشروع"
    else
        git clone "$REPO_URL" STCSAAS
        print_success "تم استنساخ المشروع"
    fi
}

# Step 3: Copy Backend Files
copy_backend() {
    print_step "المرحلة 3: نسخ ملفات Laravel Backend"
    
    # Create backend directory if not exists
    mkdir -p "$BACKEND_DIR"
    
    # Copy files (excluding .env if exists)
    if [ -f "$BACKEND_DIR/.env" ]; then
        cp -r "$TEMP_DIR/STCSAAS/apps/cloud-laravel/"* "$BACKEND_DIR/"
        # Restore .env
        cp "$BACKEND_DIR/.env.backup."* "$BACKEND_DIR/.env" 2>/dev/null || true
        print_success "تم نسخ ملفات Backend مع الحفاظ على .env"
    else
        cp -r "$TEMP_DIR/STCSAAS/apps/cloud-laravel/"* "$BACKEND_DIR/"
        print_success "تم نسخ ملفات Backend"
    fi
}

# Step 4: Copy Frontend Files
copy_frontend() {
    print_step "المرحلة 4: نسخ ملفات React Frontend"
    
    # Create frontend directory if not exists
    mkdir -p "$FRONTEND_DIR"
    
    cp -r "$TEMP_DIR/STCSAAS/apps/web-portal/"* "$FRONTEND_DIR/"
    print_success "تم نسخ ملفات Frontend"
}

# Step 5: Install Backend Dependencies
install_backend() {
    print_step "المرحلة 5: تثبيت Composer Dependencies"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f "composer.json" ]; then
        print_error "ملف composer.json غير موجود!"
        exit 1
    fi
    
    composer install --no-dev --optimize-autoloader --no-interaction
    print_success "تم تثبيت Composer Dependencies"
}

# Step 6: Setup Laravel
setup_laravel() {
    print_step "المرحلة 6: إعداد Laravel"
    
    cd "$BACKEND_DIR"
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "تم نسخ .env.example إلى .env - يرجى تعديل الإعدادات"
        else
            print_error "ملف .env و .env.example غير موجودين!"
            exit 1
        fi
    fi
    
    # Clear all caches
    php artisan cache:clear 2>/dev/null || true
    php artisan config:clear 2>/dev/null || true
    php artisan route:clear 2>/dev/null || true
    php artisan view:clear 2>/dev/null || true
    
    # Create storage link
    php artisan storage:link 2>/dev/null || true
    
    # Run migrations
    php artisan migrate --force 2>/dev/null || print_warning "فشل تشغيل Migrations - تحقق من قاعدة البيانات"
    
    # Optimize
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    print_success "تم إعداد Laravel"
}

# Step 7: Set Permissions
set_permissions() {
    print_step "المرحلة 7: تعيين الصلاحيات"
    
    cd "$BACKEND_DIR"
    
    chmod -R 755 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || \
    chown -R nginx:nginx storage bootstrap/cache 2>/dev/null || \
    print_warning "تعذر تعيين المالك - قد تحتاج لتعيينه يدوياً"
    
    print_success "تم تعيين الصلاحيات"
}

# Step 8: Install Frontend Dependencies
install_frontend() {
    print_step "المرحلة 8: تثبيت npm Dependencies"
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        print_error "ملف package.json غير موجود!"
        exit 1
    fi
    
    # Clean old build
    rm -rf dist node_modules/.vite
    
    npm install --production=false
    print_success "تم تثبيت npm Dependencies"
}

# Step 9: Build Frontend
build_frontend() {
    print_step "المرحلة 9: بناء React Frontend"
    
    cd "$FRONTEND_DIR"
    
    npm run build
    
    if [ -d "dist" ]; then
        print_success "تم بناء Frontend بنجاح"
    else
        print_error "فشل بناء Frontend - مجلد dist غير موجود"
        exit 1
    fi
}

# Step 10: Cleanup
cleanup() {
    print_step "المرحلة 10: تنظيف الملفات المؤقتة"
    
    rm -rf "$TEMP_DIR"
    print_success "تم التنظيف"
}

# Step 11: Test Configuration
test_config() {
    print_step "المرحلة 11: اختبار الإعدادات"
    
    # Test Laravel
    cd "$BACKEND_DIR"
    php artisan route:list > /dev/null 2>&1 && print_success "Laravel Routes تعمل" || print_warning "تحقق من Laravel Routes"
    
    # Test Frontend Build
    if [ -f "$FRONTEND_DIR/dist/index.html" ]; then
        print_success "Frontend Build موجود"
    else
        print_warning "Frontend Build غير موجود"
    fi
}

# Main Execution
main() {
    echo "============================================"
    echo "STC AI-VAP Platform - Deployment Script"
    echo "============================================"
    echo ""
    
    backup_env
    clone_repo
    copy_backend
    copy_frontend
    install_backend
    setup_laravel
    set_permissions
    install_frontend
    build_frontend
    cleanup
    test_config
    
    echo ""
    echo "============================================"
    print_success "اكتمل التنصيب بنجاح!"
    echo "============================================"
    echo ""
    echo "الخطوات التالية:"
    echo "1. تحقق من ملف .env في $BACKEND_DIR"
    echo "2. تحقق من إعدادات Nginx"
    echo "3. أعد تحميل Nginx: sudo systemctl reload nginx"
    echo "4. اختبر الموقع: http://stcsolutions.online"
    echo "5. اختبر API: http://api.stcsolutions.online/api/v1/public/landing"
    echo ""
}

# Run main function
main



