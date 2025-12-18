# Super Admin Settings Documentation

## Overview

The Super Admin Control Panel provides enterprise-level configuration governing the entire AI-VAP platform. Super Admins have full access to global system configuration, platform branding, tenant management, feature governance, and subscription control.

## Database Schema

### Tables

#### `system_settings`
Global platform configuration (single row).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| platform_name | text | Platform display name |
| platform_tagline | text | Marketing tagline |
| support_email | text | Support contact email |
| support_phone | text | Support phone number |
| default_timezone | text | Default timezone (e.g., 'UTC') |
| default_language | text | Default language code (e.g., 'en') |
| maintenance_mode | boolean | Enable maintenance mode |
| maintenance_message | text | Custom maintenance message |
| session_timeout_minutes | integer | Session timeout duration |
| max_login_attempts | integer | Max failed login attempts |
| password_min_length | integer | Minimum password length |
| require_2fa | boolean | Require two-factor authentication |
| allow_registration | boolean | Allow new user registration |
| require_email_verification | boolean | Require email verification |

#### `platform_branding`
Platform visual identity.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| logo_url | text | Primary logo URL |
| logo_dark_url | text | Dark mode logo URL |
| favicon_url | text | Favicon URL |
| primary_color | text | Primary brand color (hex) |
| secondary_color | text | Secondary brand color (hex) |
| accent_color | text | Accent color (hex) |
| danger_color | text | Danger/error color (hex) |
| warning_color | text | Warning color (hex) |
| success_color | text | Success color (hex) |
| font_family | text | Primary font family |
| heading_font | text | Heading font family |
| border_radius | text | Border radius value |
| custom_css | text | Custom CSS overrides |

#### `super_admins`
Super admin user assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | integer | Reference to users table |
| permissions | jsonb | Granular permission flags |

## API Endpoints

### System Settings

```
GET    /api/v1/super-admin/settings
PUT    /api/v1/super-admin/settings
```

### Platform Branding

```
GET    /api/v1/super-admin/branding
PUT    /api/v1/super-admin/branding
```

### Super Admin Management

```
GET    /api/v1/super-admin/admins
POST   /api/v1/super-admin/admins
DELETE /api/v1/super-admin/admins/:id
GET    /api/v1/super-admin/check
```

## Super Admin Responsibilities

1. **Global System Configuration**
   - Platform name and tagline
   - Support contact information
   - Default timezone and language
   - Security policies (2FA, session timeout, password requirements)

2. **Platform Branding & Identity**
   - Logo management (light/dark mode)
   - Favicon
   - Color scheme
   - Typography
   - Custom CSS

3. **Tenant (Organization) Management**
   - Create/edit/delete organizations
   - Assign subscription plans
   - Monitor usage and limits

4. **Feature & Module Governance**
   - Enable/disable AI modules globally
   - Configure default settings
   - Set plan-based availability

5. **Subscription & Licensing Control**
   - Manage subscription plans
   - Generate and manage licenses
   - Set feature limits per plan

6. **Landing Page Management**
   - Configure all landing page content
   - Manage SEO settings
   - Enable maintenance/coming-soon mode

## UI Pages

| Page | Path | Purpose |
|------|------|---------|
| System Settings | `/admin/super-admin-settings` | Platform configuration |
| Platform Branding | `/admin/platform-branding` | Visual identity management |
| Super Admin Management | `/admin/super-admin-management` | Manage super admin users |
| Landing Page Config | `/admin/landing-page-config` | Landing page configuration |

## Security

- All super admin endpoints require authentication
- RLS policies restrict access to super admins only
- Sensitive operations are logged
- Changes to system settings trigger cache invalidation

## White-Label Readiness

The platform is fully white-label ready:

- No hard-coded platform names
- No hard-coded logos or colors
- All branding configurable via UI
- Custom CSS support for advanced customization
- Per-organization branding support

## Configuration Storage

All configurations are:
- Stored in PostgreSQL database
- Applied dynamically (no rebuilds required)
- Cached safely where applicable
- Synced to Edge Servers via API
