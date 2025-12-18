#!/bin/bash

#############################################################################
# سكريبت رفع تحديث المصادقة - Laravel Sanctum
# الهدف: رفع إصلاحات المصادقة للخادم الخلفي والواجهة الأمامية
# التاريخ: 2025-12-17
#############################################################################

set -e

echo "🚀 بدء رفع تحديث المصادقة..."
echo ""

# ألوان للإخراج
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # بدون لون

# الحصول على مجلد السكريبت
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📂 مجلد السكريبت: $SCRIPT_DIR"
echo "📂 مجلد المشروع: $PROJECT_ROOT"
echo ""

#############################################################################
# الخطوة 1: التحقق من المتطلبات
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 1: التحقق من المتطلبات"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# التحقق من وجود المجلدات
if [ ! -d "$PROJECT_ROOT/apps/cloud-laravel" ]; then
    echo -e "${RED}❌ خطأ: apps/cloud-laravel غير موجود!${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/apps/web-portal" ]; then
    echo -e "${RED}❌ خطأ: apps/web-portal غير موجود!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} هيكل المشروع تم التحقق منه"

# التحقق من وجود الملفات المعدلة
if [ ! -f "$SCRIPT_DIR/apps/cloud-laravel/routes/api.php" ]; then
    echo -e "${RED}❌ خطأ: api.php غير موجود في مجلد التحديث!${NC}"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/apps/cloud-laravel/app/Http/Controllers/AuthController.php" ]; then
    echo -e "${RED}❌ خطأ: AuthController.php غير موجود في مجلد التحديث!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} الملفات المعدلة موجودة"
echo ""

#############################################################################
# الخطوة 2: النسخ الاحتياطي
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 2: عمل نسخ احتياطي للملفات الحالية"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKUP_DIR="$PROJECT_ROOT/backups/auth_update_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# نسخ ملفات Laravel
if [ -f "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php" ]; then
    cp "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php" "$BACKUP_DIR/api.php.backup"
    echo -e "${GREEN}✓${NC} تم النسخ الاحتياطي لـ api.php"
fi

if [ -f "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php" ]; then
    cp "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php" "$BACKUP_DIR/AuthController.php.backup"
    echo -e "${GREEN}✓${NC} تم النسخ الاحتياطي لـ AuthController.php"
fi

echo -e "${BLUE}ℹ${NC}  النسخ الاحتياطي محفوظة في: $BACKUP_DIR"
echo ""

#############################################################################
# الخطوة 3: نسخ ملفات الخادم الخلفي
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 3: نسخ ملفات Laravel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# نسخ api.php
cp "$SCRIPT_DIR/apps/cloud-laravel/routes/api.php" \
   "$PROJECT_ROOT/apps/cloud-laravel/routes/api.php"
echo -e "${GREEN}✓${NC} تم نسخ api.php"

# نسخ AuthController.php
cp "$SCRIPT_DIR/apps/cloud-laravel/app/Http/Controllers/AuthController.php" \
   "$PROJECT_ROOT/apps/cloud-laravel/app/Http/Controllers/AuthController.php"
echo -e "${GREEN}✓${NC} تم نسخ AuthController.php"

echo ""

#############################################################################
# الخطوة 4: نسخ إعدادات الواجهة
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 4: نسخ إعدادات الواجهة الأمامية"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# نسخ .env
cp "$SCRIPT_DIR/apps/web-portal/.env" \
   "$PROJECT_ROOT/apps/web-portal/.env"
echo -e "${GREEN}✓${NC} تم نسخ web-portal/.env"

echo ""

#############################################################################
# الخطوة 5: تنظيف الكاش
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 5: تنظيف كاش Laravel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT/apps/cloud-laravel"

php artisan route:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  لم يتمكن من تنظيف كاش المسارات"
php artisan config:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  لم يتمكن من تنظيف كاش الإعدادات"
php artisan cache:clear 2>/dev/null || echo -e "${YELLOW}⚠${NC}  لم يتمكن من تنظيف كاش التطبيق"

echo -e "${GREEN}✓${NC} تم تنظيف كاش Laravel"
echo ""

#############################################################################
# الخطوة 6: التحقق من المسارات
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "الخطوة 6: التحقق من مسارات Laravel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT/apps/cloud-laravel"

echo "التحقق من مسارات المصادقة..."
if php artisan route:list | grep -q "api/v1/auth/login"; then
    echo -e "${GREEN}✓${NC} المسارات مسجلة بشكل صحيح"
    echo ""
    echo "مسارات المصادقة المتاحة:"
    php artisan route:list | grep "api/v1/auth" | head -6
else
    echo -e "${RED}❌ تحذير: قد لا تكون المسارات مسجلة بشكل صحيح${NC}"
fi

echo ""

#############################################################################
# الخطوة 7: الملخص
#############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ اكتمل الرفع بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📋 ما تم إنجازه:"
echo "  • نسخ احتياطي للملفات الأصلية في: $BACKUP_DIR"
echo "  • نسخ 2 ملفات Laravel"
echo "  • نسخ 1 ملف إعدادات الواجهة"
echo "  • تنظيف كاش Laravel"
echo "  • التحقق من تسجيل المسارات"
echo ""
echo "🎯 الخطوات التالية:"
echo ""
echo "1. تشغيل خادم Laravel:"
echo "   cd apps/cloud-laravel"
echo "   php artisan serve --host 0.0.0.0 --port 8000"
echo ""
echo "2. في نافذة طرفية جديدة، تشغيل الواجهة:"
echo "   cd apps/web-portal"
echo "   npm run dev"
echo ""
echo "3. فتح المتصفح على http://localhost:5173"
echo ""
echo "4. اختبار المصادقة:"
echo "   • اضغط 'إنشاء حساب تجريبي'"
echo "   • سجل دخول ببيانات الحساب المنشأ"
echo "   • تحقق من استمرار الجلسة عند التحديث"
echo "   • اختبر تسجيل الخروج"
echo ""
echo "📖 التوثيق الكامل:"
echo "  • update/README.md"
echo ""
echo "🔍 استكشاف الأخطاء:"
echo "  • راجع سجلات Laravel: apps/cloud-laravel/storage/logs/laravel.log"
echo "  • راجع console المتصفح للأخطاء"
echo "  • تحقق من VITE_API_URL في apps/web-portal/.env"
echo "  • تأكد من تشغيل كلا الخادمين"
echo ""
echo -e "${GREEN}🎉 جاهز للاختبار!${NC}"
echo ""
