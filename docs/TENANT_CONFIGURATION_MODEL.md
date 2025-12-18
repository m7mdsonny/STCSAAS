# Tenant Configuration Model Documentation

## Overview

Each organization (tenant) in the AI-VAP platform has its own isolated configuration. Settings are managed from both Super Admin and Organization Admin panels, ensuring complete tenant isolation while allowing platform-wide governance.

## Database Schema

### Tables

#### `organization_settings`
Per-tenant configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| timezone | text | Organization timezone |
| language | text | Preferred language |
| date_format | text | Date display format |
| time_format | text | Time format (12h/24h) |
| currency | text | Currency code |
| session_timeout_minutes | integer | Session timeout |
| require_2fa | boolean | Require 2FA for org users |
| allowed_ip_ranges | text[] | Allowed IP ranges |
| email_notifications | boolean | Enable email alerts |
| push_notifications | boolean | Enable push alerts |
| sms_notifications | boolean | Enable SMS alerts |
| webhook_notifications | boolean | Enable webhook alerts |
| webhook_url | text | Webhook endpoint URL |
| alert_sound_enabled | boolean | Play alert sounds |
| alert_escalation_enabled | boolean | Enable escalation |
| alert_auto_acknowledge_minutes | integer | Auto-acknowledge timer |
| event_retention_days | integer | Event data retention |
| video_retention_days | integer | Video data retention |
| features_enabled | jsonb | Feature toggle flags |

#### `organization_branding`
Per-tenant visual identity.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| logo_url | text | Organization logo |
| logo_dark_url | text | Dark mode logo |
| favicon_url | text | Custom favicon |
| primary_color | text | Primary brand color |
| secondary_color | text | Secondary color |
| accent_color | text | Accent color |
| font_family | text | Custom font |
| custom_css | text | Custom CSS |
| report_header_html | text | Report header |
| report_footer_html | text | Report footer |

#### `organization_notification_settings`
Alert notification configuration per type/severity.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| alert_type | text | Type of alert |
| severity | text | Severity level |
| email_enabled | boolean | Send email |
| push_enabled | boolean | Send push notification |
| sms_enabled | boolean | Send SMS |
| webhook_enabled | boolean | Send webhook |
| email_recipients | text[] | Email addresses |
| sms_recipients | text[] | Phone numbers |
| quiet_hours_start | time | Quiet hours start |
| quiet_hours_end | time | Quiet hours end |
| throttle_minutes | integer | Alert throttle period |

#### `organization_integrations`
Third-party integration configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| integration_type | text | Integration type |
| name | text | Integration name |
| is_enabled | boolean | Enable/disable |
| config | jsonb | Configuration data |
| credentials | jsonb | Encrypted credentials |
| status | text | Connection status |
| last_sync_at | timestamp | Last sync time |
| last_error | text | Last error message |

#### `organization_contacts`
Emergency and escalation contacts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| name | text | Contact name |
| title | text | Job title |
| email | text | Email address |
| phone | text | Phone number |
| contact_type | text | Contact type |
| is_emergency_contact | boolean | Emergency contact flag |
| escalation_order | integer | Escalation priority |
| escalation_delay_minutes | integer | Delay before escalation |
| available_start | time | Availability start |
| available_end | time | Availability end |
| available_days | text[] | Available days |

#### `alert_escalation_rules`
Automated alert escalation configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Reference to organizations |
| name | text | Rule name |
| description | text | Rule description |
| is_enabled | boolean | Enable/disable |
| alert_types | text[] | Applicable alert types |
| severity_levels | text[] | Applicable severities |
| escalation_steps | jsonb | Escalation step config |
| initial_delay_minutes | integer | Initial delay |
| repeat_interval_minutes | integer | Repeat interval |
| max_escalations | integer | Max escalation count |

## API Endpoints

### Organization Settings

```
GET    /api/v1/organizations/:id/settings
PUT    /api/v1/organizations/:id/settings
```

### Organization Branding

```
GET    /api/v1/organizations/:id/branding
PUT    /api/v1/organizations/:id/branding
POST   /api/v1/organizations/:id/branding/logo
```

### Notification Settings

```
GET    /api/v1/organizations/:id/notifications
POST   /api/v1/organizations/:id/notifications
PUT    /api/v1/organizations/:id/notifications/:notifId
DELETE /api/v1/organizations/:id/notifications/:notifId
```

### Integrations

```
GET    /api/v1/organizations/:id/integrations
POST   /api/v1/organizations/:id/integrations
PUT    /api/v1/organizations/:id/integrations/:intId
DELETE /api/v1/organizations/:id/integrations/:intId
POST   /api/v1/organizations/:id/integrations/:intId/test
```

### Contacts

```
GET    /api/v1/organizations/:id/contacts
POST   /api/v1/organizations/:id/contacts
PUT    /api/v1/organizations/:id/contacts/:contactId
DELETE /api/v1/organizations/:id/contacts/:contactId
```

### Escalation Rules

```
GET    /api/v1/organizations/:id/escalation-rules
POST   /api/v1/organizations/:id/escalation-rules
PUT    /api/v1/organizations/:id/escalation-rules/:ruleId
DELETE /api/v1/organizations/:id/escalation-rules/:ruleId
```

## Per-Organization Settings

### Available Settings

1. **General Settings**
   - Organization name & branding
   - Timezone & language
   - Date/time formats

2. **Notification Preferences**
   - Channel settings (email, push, SMS, webhook)
   - Per-alert-type configuration
   - Quiet hours
   - Throttling

3. **Enabled AI Modules**
   - Module selection within plan limits
   - Per-module configuration
   - Confidence thresholds

4. **Enabled Integrations**
   - Third-party connections
   - API credentials
   - Sync schedules

5. **Subscription Plan & Limits**
   - Current plan details
   - Usage vs limits
   - Feature availability

6. **Alert Escalation Rules**
   - Escalation paths
   - Contact assignments
   - Timing configuration

7. **Contact & Emergency Numbers**
   - Contact directory
   - Emergency contacts
   - Availability schedules

## Tenant Isolation

Each organization's settings:
- Do NOT affect other organizations
- Are applied dynamically across:
  - Web portal
  - Mobile app
  - Notifications
  - Reports
- Are enforced via Row Level Security (RLS)
- Are cached per-organization

## Configuration Hierarchy

```
Platform Settings (Super Admin)
       ↓
  Organization Settings (Org Admin)
       ↓
     User Preferences (End User)
```

Lower levels can only customize within bounds set by higher levels.

## Dynamic Application

Settings are applied:
- **Web Portal**: On page load and via context
- **Mobile App**: On login and background sync
- **Notifications**: At delivery time
- **Reports**: At generation time
- **Edge Servers**: Via sync API
