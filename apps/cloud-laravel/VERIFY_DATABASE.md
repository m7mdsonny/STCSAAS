# Database Verification and Fix Script

## Issue
The `PublicContentController` is failing because:
1. The `platform_contents` table may not have the `published` column
2. The table may not exist at all
3. The table may be empty

## Quick Fix Commands

### 1. Check if table exists
```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan tinker
```

In tinker:
```php
// Check if table exists
Schema::hasTable('platform_contents');

// Check if published column exists
Schema::hasColumn('platform_contents', 'published');

// Check table structure
DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'platform_contents'");

// Check if any records exist
PlatformContent::count();
```

### 2. Run migrations
```bash
cd /www/wwwroot/api.stcsolutions.online
php artisan migrate --force
```

### 3. Create initial landing content (if needed)
```bash
php artisan tinker
```

In tinker:
```php
use App\Models\PlatformContent;

// Create landing settings if doesn't exist
PlatformContent::firstOrCreate(
    ['key' => 'landing_settings'],
    [
        'value' => json_encode([]),
        'section' => 'landing',
        'published' => true,
    ]
);

// Verify
PlatformContent::where('key', 'landing_settings')->first();
```

### 4. Test the endpoint
```bash
curl https://api.stcsolutions.online/api/v1/public/landing
```

## Expected Response
```json
{
  "content": {
    "hero_title": "منصة تحليل الفيديو بالذكاء الاصطناعي",
    "hero_subtitle": "...",
    ...
  },
  "published": true
}
```

