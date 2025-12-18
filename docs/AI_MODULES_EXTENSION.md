# AI Modules Extension Documentation

## Overview

This document describes the AI modules available in the AI-VAP platform, including three new industrial and safety modules. All AI inference runs 100% locally on Edge Servers - Cloud is for configuration, monitoring, licensing, and alerts only.

## Core Architecture Rule

**NON-NEGOTIABLE:**
- AI inference, detection, and decision-making MUST remain local on Edge Servers
- Cloud handles: configuration, monitoring, licensing, alerts, reporting
- No raw video/images transmitted to Cloud
- Only event metadata and structured data synced

## AI Modules

### Existing Modules

| Module Key | Name | Category | Description |
|------------|------|----------|-------------|
| fire_detection | Fire & Smoke Detection | Safety | Real-time fire and smoke detection |
| intrusion_detection | Intrusion Detection | Security | Unauthorized access and perimeter breach detection |
| face_recognition | Face Recognition | Identification | Individual identification and verification |
| vehicle_recognition | Vehicle Recognition | Identification | License plate and vehicle identification |
| crowd_detection | Crowd Detection | Monitoring | Crowd density and movement monitoring |
| ppe_detection | PPE Detection | Safety | Personal protective equipment compliance |

### NEW Modules

#### 1. Production Line Monitoring (`production_monitoring`)

**Purpose:** Monitor production lines and factory floors

**Detection Capabilities:**
- Production stoppage detection
- Abnormal workflow patterns
- Machine idle time tracking
- Safety violations (restricted zones)
- Missing PPE in production areas

**Edge Server Responsibilities:**
- Real-time video analysis
- Local rule evaluation
- Event generation (stoppage, anomaly, violation)
- Hardware integration (sirens, relays)

**Cloud Responsibilities:**
- Configure monitoring zones
- Set thresholds (time, count, movement)
- Define allowed schedules
- Configure alert rules
- Display production KPIs
- Generate downtime reports
- Store incident history

**Camera Requirements:**
- Type: Fixed or PTZ industrial cameras
- Resolution: Minimum 1080p recommended
- FPS: Minimum 15 FPS

#### 2. Warehouse Monitoring (`warehouse_monitoring`)

**Purpose:** Monitor warehouses and storage areas

**Detection Capabilities:**
- Unauthorized access detection
- Overcrowding detection
- Blocked aisle detection
- Abnormal movement patterns
- Inventory area violations (visual)

**Edge Server Responsibilities:**
- Local detection and tracking
- Zone comparison with configured areas
- Trigger local actions (alarm, siren)
- Real-time alert generation

**Cloud Responsibilities:**
- Define warehouse zones
- Configure alerts & escalation
- Dashboard visualization
- Reporting (daily/weekly/monthly)

**Camera Requirements:**
- Type: Wide-angle fixed cameras
- Resolution: Minimum 720p
- FPS: Minimum 15 FPS

#### 3. Swimming Pool Drowning Detection (`drowning_detection`)

**Purpose:** Detect drowning or abnormal behavior in swimming pools

**CRITICAL SAFETY MODULE - Prioritizes false-negative avoidance**

**Detection Capabilities:**
- Prolonged submersion detection
- Irregular movement patterns
- Lack of motion in water zones
- Person tracking in pool areas

**Edge Server Responsibilities:**
- Continuous real-time analysis
- Low-latency detection (< 1 second)
- Immediate local action:
  - Siren activation
  - Visual alert display
  - Relay trigger (lights, alarms)
- High-priority event generation

**Cloud Responsibilities:**
- Configure pool zones
- Set sensitivity thresholds
- Configure time thresholds
- Define alert escalation paths
- Log all incidents
- Notify operators instantly
- Push to mobile app immediately

**Camera Requirements:**
- Type: Overhead pool cameras
- Resolution: Minimum 1080p
- FPS: Minimum 25 FPS (higher recommended)
- Placement: Overhead view of entire pool

**Safety Priority:**
This module MUST prioritize false-negative avoidance over false positives. Better to have occasional false alarms than miss a drowning event.

## Database Schema

### `ai_modules`
System-wide AI module definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| module_key | text | Unique identifier |
| name | text | Display name |
| description | text | Module description |
| category | text | Category (safety, security, etc.) |
| is_enabled | boolean | Globally enabled |
| is_premium | boolean | Premium feature flag |
| min_plan_level | integer | Minimum subscription level |
| config_schema | jsonb | Configuration schema |
| default_config | jsonb | Default configuration |
| required_camera_type | text | Required camera type |
| min_fps | integer | Minimum FPS requirement |
| min_resolution | text | Minimum resolution |
| icon | text | Icon identifier |
| display_order | integer | Display order |

### `ai_module_configs`
Per-organization module configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization reference |
| module_id | integer | Module reference |
| is_enabled | boolean | Enabled for organization |
| is_licensed | boolean | Licensed for organization |
| config | jsonb | Custom configuration |
| confidence_threshold | numeric | Detection confidence (0-1) |
| alert_threshold | integer | Events before alert |
| cooldown_seconds | integer | Cooldown between alerts |
| schedule_enabled | boolean | Enable scheduling |
| schedule | jsonb | Schedule configuration |

## API Endpoints

### AI Modules (Super Admin)

```
GET    /api/v1/ai-modules
GET    /api/v1/ai-modules/:id
PUT    /api/v1/ai-modules/:id
```

### Organization Module Configuration

```
GET    /api/v1/ai-modules/configs
GET    /api/v1/ai-modules/configs/:moduleId
PUT    /api/v1/ai-modules/configs/:moduleId
POST   /api/v1/ai-modules/configs/:moduleId/enable
POST   /api/v1/ai-modules/configs/:moduleId/disable
```

## Subscription Integration

Each AI module:
- Is subscription-controlled
- Has plan-based availability
- Enforces entitlement at Edge level

### Plan Availability

| Plan | Available Modules |
|------|-------------------|
| Starter | fire_detection, intrusion_detection |
| Professional | + face_recognition, vehicle_recognition, crowd_detection |
| Enterprise | + ppe_detection, production_monitoring, warehouse_monitoring, drowning_detection |

## Integration Points

### 1. Edge Server
- AI inference logic (local)
- Local rules engine
- Local SQLite database
- Hardware integration (sirens, relays)

### 2. Cloud Control Panel (Laravel)
- Module enable/disable
- Configuration UI
- Reference image management
- Rules & actions setup
- Reporting & dashboards

### 3. Web Portal (React)
- Configuration screens
- Monitoring dashboards
- Alerts & history views
- NO AI logic

### 4. Mobile App (Flutter)
- Real-time alerts
- Incident history
- Read-only dashboards

## Event Types

Each module generates specific event types:

| Module | Event Types |
|--------|-------------|
| production_monitoring | production_stopped, workflow_anomaly, machine_idle, safety_violation |
| warehouse_monitoring | unauthorized_access, overcrowding, blocked_aisle, movement_anomaly |
| drowning_detection | drowning_detected, prolonged_submersion, irregular_movement |

## Configuration Options

### Common Options (All Modules)
- Confidence threshold (0.5 - 1.0)
- Alert threshold (event count)
- Cooldown period (seconds)
- Schedule (active hours/days)

### Module-Specific Options

**production_monitoring:**
- Stoppage duration threshold
- Idle time threshold
- Restricted zone definitions
- Production schedule

**warehouse_monitoring:**
- Zone definitions
- Crowd density thresholds
- Aisle blocking sensitivity
- Access control integration

**drowning_detection:**
- Submersion time threshold (seconds)
- Motion sensitivity
- Pool zone boundaries
- Immediate action triggers
