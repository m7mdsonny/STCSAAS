# AI Model Training Interface Documentation

## Overview

The AI Model Training Interface provides a controlled, professional system to manage AI model training without moving inference to the Cloud. Training is orchestrated in the Cloud, but inference always remains local on Edge Servers.

## Core Rules (CRITICAL)

- Cloud NEVER performs inference
- Edge NEVER trains models
- Training pipeline is managed in Cloud
- Inference remains local on Edge
- No automatic deployment without approval

## Training Interface Capabilities

### 1. Dataset Management

- Upload datasets (images/labeled samples)
- Organize by AI module, version, environment
- Track labeling progress
- Version control for datasets

### 2. Labeling & Review

- Review labeled samples
- Approve/reject samples
- Track labeling quality
- Multi-annotator support

### 3. Training Jobs

- Trigger training jobs
- Configure hyperparameters
- Track job status (pending/running/failed/completed)
- View training metrics (accuracy, loss)
- Monitor progress in real-time

### 4. Model Versioning

- Semantic versioned AI models
- Rollback capability
- Deployment status tracking
- Performance metrics per version

## Model Deployment Flow

```
Dataset Upload
      ↓
Labeling & Verification
      ↓
Cloud Training Job
      ↓
Model Version Created
      ↓
Admin Approval (REQUIRED)
      ↓
Secure Model Distribution
      ↓
Edge Server Downloads Model
      ↓
Edge Server Uses New Model
```

**IMPORTANT:** No automatic deployment without explicit admin approval.

## Database Schema

### `training_datasets`
Training dataset definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization (null for global) |
| name | text | Dataset name |
| description | text | Dataset description |
| ai_module | text | Target AI module |
| sample_count | integer | Total samples |
| labeled_count | integer | Labeled samples |
| verified_count | integer | Verified samples |
| label_schema | jsonb | Label definitions |
| environment | text | dev/staging/production |
| version | text | Dataset version |
| status | text | draft/active/archived |
| created_by | integer | Creator user ID |

### `training_samples`
Individual training samples.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| dataset_id | uuid | Dataset reference |
| file_url | text | Sample file URL |
| file_type | text | image/video |
| file_size | integer | File size in bytes |
| labels | jsonb | Applied labels |
| annotations | jsonb | Bounding boxes, etc. |
| source_camera_id | uuid | Source camera |
| captured_at | timestamp | Capture time |
| metadata | jsonb | Additional metadata |
| is_labeled | boolean | Labeling complete |
| is_verified | boolean | Verification complete |
| labeled_by | integer | Labeler user ID |
| verified_by | integer | Verifier user ID |
| quality_score | numeric | Quality rating |
| rejection_reason | text | Rejection reason |

### `training_jobs`
Training job queue.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | integer | Organization reference |
| name | text | Job name |
| description | text | Job description |
| ai_module | text | Target AI module |
| dataset_id | uuid | Training dataset |
| base_model_version | uuid | Base model to fine-tune |
| training_config | jsonb | Training configuration |
| hyperparameters | jsonb | Hyperparameter settings |
| status | text | pending/queued/running/completed/failed/cancelled |
| progress_percent | integer | Progress 0-100 |
| current_epoch | integer | Current training epoch |
| total_epochs | integer | Total epochs |
| metrics | jsonb | Training metrics |
| training_logs | text | Full training logs |
| output_model_version | uuid | Resulting model version |
| started_at | timestamp | Job start time |
| completed_at | timestamp | Job completion time |
| estimated_completion | timestamp | ETA |
| error_message | text | Error if failed |
| created_by | integer | Creator user ID |

### `ai_model_versions`
Versioned AI models.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ai_module | text | AI module identifier |
| version | text | Semantic version |
| name | text | Model name |
| description | text | Model description |
| training_job_id | uuid | Source training job |
| base_version_id | uuid | Base model version |
| model_file_url | text | Model file location |
| model_file_size | integer | File size |
| config_file_url | text | Config file location |
| accuracy | numeric | Model accuracy |
| precision_score | numeric | Precision metric |
| recall_score | numeric | Recall metric |
| f1_score | numeric | F1 score |
| inference_time_ms | integer | Inference latency |
| min_edge_version | text | Required Edge version |
| supported_platforms | text[] | Supported platforms |
| status | text | draft/testing/approved/released/deprecated |
| is_approved | boolean | Approval status |
| approved_by | integer | Approver user ID |
| approved_at | timestamp | Approval time |
| is_released | boolean | Release status |
| released_at | timestamp | Release time |
| release_notes | text | Release notes |

### `model_deployments`
Model deployments to Edge servers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| model_version_id | uuid | Model version |
| edge_server_id | integer | Target Edge server |
| status | text | pending/downloading/installing/completed/failed |
| progress_percent | integer | Download/install progress |
| scheduled_at | timestamp | Scheduled deployment time |
| started_at | timestamp | Actual start time |
| completed_at | timestamp | Completion time |
| error_message | text | Error if failed |
| retry_count | integer | Retry attempts |

## API Endpoints

### Datasets

```
GET    /api/v1/training/datasets
GET    /api/v1/training/datasets/:id
POST   /api/v1/training/datasets
PUT    /api/v1/training/datasets/:id
DELETE /api/v1/training/datasets/:id
```

### Samples

```
GET    /api/v1/training/datasets/:id/samples
POST   /api/v1/training/datasets/:id/samples
PUT    /api/v1/training/datasets/:id/samples/:sampleId
DELETE /api/v1/training/datasets/:id/samples/:sampleId
POST   /api/v1/training/datasets/:id/samples/:sampleId/verify
```

### Training Jobs

```
GET    /api/v1/training/jobs
GET    /api/v1/training/jobs/:id
POST   /api/v1/training/jobs
POST   /api/v1/training/jobs/:id/cancel
GET    /api/v1/training/jobs/:id/logs
```

### Model Versions

```
GET    /api/v1/training/models
GET    /api/v1/training/models/:id
PUT    /api/v1/training/models/:id
POST   /api/v1/training/models/:id/approve
POST   /api/v1/training/models/:id/release
POST   /api/v1/training/models/:id/deprecate
```

### Deployments

```
GET    /api/v1/training/models/:id/deployments
POST   /api/v1/training/models/:id/deploy
POST   /api/v1/training/models/:id/deploy-all
POST   /api/v1/training/deployments/:id/retry
```

## Architecture Placement

### Cloud (Laravel)
- Training job orchestration
- Dataset & model storage
- Versioning & approvals
- Subscription enforcement
- API for Edge model downloads

### Edge Server
- Receives model updates via secure download
- Loads models locally
- Continues inference offline
- Reports model version in heartbeat

### Web Portal
- Training UI (Super Admin only)
- Model management dashboards
- Deployment monitoring

### Mobile App
- Read-only status:
  - Training job status
  - Active model version per Edge

## Access Control & Subscriptions

### Access Levels

| Role | Access |
|------|--------|
| Super Admin | Full training interface access |
| Organization Admin | View only (if Enterprise plan) |
| Others | No access |

### Plan Limits

| Feature | Professional | Enterprise |
|---------|--------------|------------|
| Training Jobs/Month | 0 | 10 |
| Dataset Size | N/A | 10GB |
| Active Models | N/A | 5 per module |
| Custom Training | No | Yes |

## Training Job Lifecycle

1. **Pending**: Job created, waiting in queue
2. **Queued**: Job scheduled for execution
3. **Running**: Training in progress
4. **Completed**: Training finished successfully
5. **Failed**: Training failed with error
6. **Cancelled**: Job cancelled by user

## Model Version Lifecycle

1. **Draft**: Initial version, not yet tested
2. **Testing**: Undergoing validation
3. **Approved**: Approved for release
4. **Released**: Available for deployment
5. **Deprecated**: No longer recommended

## Deployment Process

1. Admin releases model version
2. Admin initiates deployment (single or all Edge servers)
3. Edge server receives deployment notification
4. Edge downloads model from secure URL
5. Edge verifies model integrity
6. Edge loads new model
7. Edge reports successful deployment
8. Deployment marked complete

## Rollback Procedure

1. Identify problematic model version
2. Select previous stable version
3. Initiate deployment of previous version
4. Monitor deployment status
5. Deprecate problematic version

## Security Considerations

- Model files stored in secure storage
- Signed download URLs with expiration
- Model integrity verification on Edge
- Audit logging of all training operations
- Role-based access control
