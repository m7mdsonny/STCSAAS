# Advanced Analytics Documentation

## Overview

The Advanced Analytics module provides enterprise-grade insights based on historical events and metadata only, without using raw video or images. This ensures privacy compliance while delivering powerful analytical capabilities.

## Core Rules (Non-Negotiable)

- NO raw video in analytics
- NO AI inference in Cloud
- NO privacy-sensitive data stored
- Event-based analytics ONLY

## Analytics Capabilities

### 1. Time-Based Analytics

- Events over time (hourly/daily/weekly/monthly)
- AI module performance trends
- Peak activity periods
- Seasonal patterns
- Year-over-year comparisons

### 2. Location & Zone Analytics

- Events per site
- Events per zone
- Events per camera
- Heatmaps based on event density
- Geographic distribution

### 3. Operational Analytics

- Downtime vs uptime metrics
- False alert ratio
- Alert response times
- Escalation effectiveness
- System health indicators

### 4. Comparative Analytics

- Site vs site comparison
- Period vs period comparison
- AI module vs AI module comparison
- Before/after analysis
- Benchmark reporting

## Database Schema

### `analytics_events`
Aggregated event data for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization reference |
| event_date | date | Event date |
| event_hour | integer | Hour of day (0-23) |
| site_id | integer | Site reference |
| zone_id | uuid | Zone reference |
| camera_id | uuid | Camera reference |
| edge_server_id | integer | Edge server reference |
| event_type | text | Type of event |
| ai_module | text | AI module that generated event |
| severity | text | Event severity |
| event_count | integer | Number of events |
| acknowledged_count | integer | Acknowledged events |
| resolved_count | integer | Resolved events |
| false_positive_count | integer | False positives |
| avg_response_time_seconds | numeric | Average response time |

### `analytics_reports`
Generated and scheduled reports.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization reference |
| name | text | Report name |
| description | text | Report description |
| report_type | text | Type of report |
| parameters | jsonb | Report parameters |
| filters | jsonb | Applied filters |
| date_range_start | timestamp | Start date |
| date_range_end | timestamp | End date |
| format | text | Output format (pdf/csv) |
| file_url | text | Generated file URL |
| file_size | integer | File size in bytes |
| is_scheduled | boolean | Is scheduled report |
| schedule_cron | text | Cron expression |
| last_generated_at | timestamp | Last generation time |
| next_scheduled_at | timestamp | Next scheduled run |
| recipients | text[] | Email recipients |
| status | text | Report status |
| error_message | text | Error message if failed |
| created_by | integer | Creator user ID |

### `analytics_dashboards`
Custom dashboard configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization reference |
| name | text | Dashboard name |
| description | text | Dashboard description |
| is_default | boolean | Default dashboard flag |
| layout | jsonb | Layout configuration |
| is_public | boolean | Publicly accessible |
| shared_with | integer[] | Shared user IDs |
| created_by | integer | Creator user ID |

### `analytics_widgets`
Dashboard widget configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| dashboard_id | uuid | Dashboard reference |
| name | text | Widget name |
| widget_type | text | Type of widget |
| config | jsonb | Widget configuration |
| data_source | text | Data source identifier |
| filters | jsonb | Widget-specific filters |
| position_x | integer | X position |
| position_y | integer | Y position |
| width | integer | Widget width |
| height | integer | Widget height |

## API Endpoints

### Analytics Data

```
GET    /api/v1/analytics/summary
GET    /api/v1/analytics/time-series
GET    /api/v1/analytics/by-location
GET    /api/v1/analytics/by-module
GET    /api/v1/analytics/response-times
GET    /api/v1/analytics/compare
GET    /api/v1/analytics/export
```

### Reports

```
GET    /api/v1/analytics/reports
GET    /api/v1/analytics/reports/:id
POST   /api/v1/analytics/reports
PUT    /api/v1/analytics/reports/:id
DELETE /api/v1/analytics/reports/:id
POST   /api/v1/analytics/reports/:id/generate
GET    /api/v1/analytics/reports/:id/download
```

### Dashboards

```
GET    /api/v1/analytics/dashboards
GET    /api/v1/analytics/dashboards/:id
POST   /api/v1/analytics/dashboards
PUT    /api/v1/analytics/dashboards/:id
DELETE /api/v1/analytics/dashboards/:id
POST   /api/v1/analytics/dashboards/:id/widgets
PUT    /api/v1/analytics/dashboards/:id/widgets/:widgetId
DELETE /api/v1/analytics/dashboards/:id/widgets/:widgetId
```

## Architecture Placement

### Edge Server
- Generates events
- Sends structured event metadata only
- No raw video/images transmitted

### Cloud (Laravel)
- Stores historical events
- Performs aggregation & analytics
- Exposes analytics APIs
- Generates reports

### Web Portal
- Advanced dashboards
- Interactive charts
- Filters and drill-down
- Export functionality (CSV/PDF)

### Mobile App
- Read-only analytics summaries
- Key KPIs only
- Simplified visualizations

## Access Control & Subscriptions

### Role-Based Access

| Role | Access Level |
|------|--------------|
| Super Admin | All analytics across all organizations |
| Organization Admin | Full analytics for own organization |
| Manager | Department/site-level analytics |
| User | Read-only basic analytics |

### Plan-Based Limits

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Retention Period | 30 days | 90 days | 365 days |
| Export Access | CSV only | CSV + PDF | All formats |
| Custom Dashboards | 1 | 5 | Unlimited |
| Scheduled Reports | No | 5/month | Unlimited |
| Comparative Analytics | No | Yes | Yes |
| API Access | No | Limited | Full |

## Widget Types

| Type | Description |
|------|-------------|
| counter | Single metric display |
| line_chart | Time series line chart |
| bar_chart | Bar chart comparison |
| pie_chart | Distribution pie chart |
| heatmap | Event density heatmap |
| table | Tabular data display |
| gauge | Progress/percentage gauge |
| map | Geographic visualization |

## Report Types

| Type | Description |
|------|-------------|
| summary | Executive summary report |
| detailed | Detailed event report |
| comparison | Period comparison report |
| compliance | Compliance/audit report |
| performance | System performance report |
| incident | Incident analysis report |

## Data Aggregation

Events are aggregated at multiple levels:
- Hourly (for detailed analysis)
- Daily (for trend analysis)
- Weekly (for pattern detection)
- Monthly (for long-term trends)

Aggregation happens via scheduled jobs to maintain query performance.

## Privacy Compliance

The analytics module ensures:
- No personally identifiable information stored
- No raw video or images in analytics
- Role-based access to reports
- Audit logging of all analytics access
- Data retention policies enforced
