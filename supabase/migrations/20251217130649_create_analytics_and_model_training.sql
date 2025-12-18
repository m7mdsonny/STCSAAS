/*
  # Advanced Analytics & AI Model Training
  
  1. Analytics Tables
    - `analytics_events` - Aggregated event data for analytics
    - `analytics_reports` - Generated reports
    - `analytics_dashboards` - Custom dashboard configurations
    - `analytics_widgets` - Dashboard widgets
  
  2. Model Training Tables
    - `training_datasets` - Uploaded datasets for training
    - `training_samples` - Individual samples/images
    - `training_jobs` - Training job queue
    - `ai_model_versions` - Versioned AI models
    - `model_deployments` - Model deployment to edge servers
  
  3. Features
    - Event-based analytics (no raw video)
    - Time-based, location-based, comparative analytics
    - Training pipeline management
    - Model versioning & deployment
*/

-- Analytics Events (Aggregated)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Time Dimensions
  event_date date NOT NULL,
  event_hour integer,
  
  -- Location Dimensions
  site_id integer,
  zone_id uuid,
  camera_id uuid,
  edge_server_id integer,
  
  -- Event Dimensions
  event_type text NOT NULL,
  ai_module text,
  severity text,
  
  -- Metrics
  event_count integer DEFAULT 0,
  acknowledged_count integer DEFAULT 0,
  resolved_count integer DEFAULT 0,
  false_positive_count integer DEFAULT 0,
  avg_response_time_seconds numeric(10,2),
  
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, event_date, event_hour, camera_id, event_type, severity)
);

-- Analytics Reports
CREATE TABLE IF NOT EXISTS analytics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Report Info
  name text NOT NULL,
  description text,
  report_type text NOT NULL,
  
  -- Parameters
  parameters jsonb DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  date_range_start timestamptz,
  date_range_end timestamptz,
  
  -- Output
  format text DEFAULT 'pdf',
  file_url text,
  file_size integer,
  
  -- Schedule
  is_scheduled boolean DEFAULT false,
  schedule_cron text,
  last_generated_at timestamptz,
  next_scheduled_at timestamptz,
  
  -- Recipients
  recipients text[],
  
  -- Status
  status text DEFAULT 'pending',
  error_message text,
  
  created_by integer REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics Dashboards
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dashboard Info
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  
  -- Layout
  layout jsonb DEFAULT '{"columns": 12}',
  
  -- Access
  is_public boolean DEFAULT false,
  shared_with integer[],
  
  created_by integer REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics Widgets
CREATE TABLE IF NOT EXISTS analytics_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  
  -- Widget Info
  name text NOT NULL,
  widget_type text NOT NULL,
  
  -- Configuration
  config jsonb DEFAULT '{}',
  data_source text,
  filters jsonb DEFAULT '{}',
  
  -- Position
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 4,
  height integer DEFAULT 3,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Datasets
CREATE TABLE IF NOT EXISTS training_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer,
  
  -- Dataset Info
  name text NOT NULL,
  description text,
  ai_module text NOT NULL,
  
  -- Metadata
  sample_count integer DEFAULT 0,
  labeled_count integer DEFAULT 0,
  verified_count integer DEFAULT 0,
  
  -- Labels
  label_schema jsonb DEFAULT '[]',
  
  -- Environment
  environment text DEFAULT 'development',
  version text DEFAULT '1.0',
  
  -- Status
  status text DEFAULT 'draft',
  
  created_by integer REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Samples
CREATE TABLE IF NOT EXISTS training_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES training_datasets(id) ON DELETE CASCADE,
  
  -- Sample Info
  file_url text NOT NULL,
  file_type text DEFAULT 'image',
  file_size integer,
  
  -- Labels
  labels jsonb DEFAULT '[]',
  annotations jsonb DEFAULT '[]',
  
  -- Metadata
  source_camera_id uuid,
  captured_at timestamptz,
  metadata jsonb DEFAULT '{}',
  
  -- Review
  is_labeled boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  labeled_by integer,
  verified_by integer,
  
  -- Quality
  quality_score numeric(3,2),
  rejection_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Jobs
CREATE TABLE IF NOT EXISTS training_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id integer,
  
  -- Job Info
  name text NOT NULL,
  description text,
  ai_module text NOT NULL,
  
  -- Input
  dataset_id uuid REFERENCES training_datasets(id),
  base_model_version uuid,
  
  -- Configuration
  training_config jsonb DEFAULT '{}',
  hyperparameters jsonb DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'pending',
  progress_percent integer DEFAULT 0,
  current_epoch integer,
  total_epochs integer,
  
  -- Results
  metrics jsonb DEFAULT '{}',
  training_logs text,
  
  -- Output
  output_model_version uuid,
  
  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  estimated_completion timestamptz,
  
  -- Error
  error_message text,
  
  created_by integer REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Model Versions
CREATE TABLE IF NOT EXISTS ai_model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Model Info
  ai_module text NOT NULL,
  version text NOT NULL,
  name text,
  description text,
  
  -- Source
  training_job_id uuid REFERENCES training_jobs(id),
  base_version_id uuid,
  
  -- Files
  model_file_url text,
  model_file_size integer,
  config_file_url text,
  
  -- Metrics
  accuracy numeric(5,4),
  precision_score numeric(5,4),
  recall_score numeric(5,4),
  f1_score numeric(5,4),
  inference_time_ms integer,
  
  -- Compatibility
  min_edge_version text,
  supported_platforms text[],
  
  -- Status
  status text DEFAULT 'draft',
  is_approved boolean DEFAULT false,
  approved_by integer,
  approved_at timestamptz,
  
  -- Release
  is_released boolean DEFAULT false,
  released_at timestamptz,
  release_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ai_module, version)
);

-- Model Deployments
CREATE TABLE IF NOT EXISTS model_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid REFERENCES ai_model_versions(id) ON DELETE CASCADE,
  edge_server_id integer REFERENCES edge_servers(id) ON DELETE CASCADE,
  
  -- Status
  status text DEFAULT 'pending',
  progress_percent integer DEFAULT 0,
  
  -- Timing
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Error
  error_message text,
  retry_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(model_version_id, edge_server_id)
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_deployments ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
CREATE POLICY "Users can view own org analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Analytics Reports Policies
CREATE POLICY "Users can view own org reports"
  ON analytics_reports FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org reports"
  ON analytics_reports FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Analytics Dashboards Policies
CREATE POLICY "Users can view own org dashboards"
  ON analytics_dashboards FOR SELECT
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer);

CREATE POLICY "Admins can manage own org dashboards"
  ON analytics_dashboards FOR ALL
  TO authenticated
  USING (organization_id = (auth.jwt()->>'organization_id')::integer)
  WITH CHECK (organization_id = (auth.jwt()->>'organization_id')::integer);

-- Analytics Widgets Policies
CREATE POLICY "Users can view widgets of accessible dashboards"
  ON analytics_widgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = analytics_widgets.dashboard_id
      AND d.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  );

CREATE POLICY "Admins can manage widgets"
  ON analytics_widgets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = analytics_widgets.dashboard_id
      AND d.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  );

-- Training Datasets - Super Admin only
CREATE POLICY "Super admins can view all datasets"
  ON training_datasets FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage datasets"
  ON training_datasets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Training Samples - Super Admin only
CREATE POLICY "Super admins can view all samples"
  ON training_samples FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage samples"
  ON training_samples FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Training Jobs - Super Admin only
CREATE POLICY "Super admins can view all training jobs"
  ON training_jobs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage training jobs"
  ON training_jobs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- AI Model Versions - Super Admin only for management
CREATE POLICY "Authenticated users can view released models"
  ON ai_model_versions FOR SELECT
  TO authenticated
  USING (is_released = true OR EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

CREATE POLICY "Super admins can manage model versions"
  ON ai_model_versions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Model Deployments
CREATE POLICY "Users can view own org deployments"
  ON model_deployments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM edge_servers es
      WHERE es.id = model_deployments.edge_server_id
      AND es.organization_id = (auth.jwt()->>'organization_id')::integer
    )
  );

CREATE POLICY "Super admins can manage all deployments"
  ON model_deployments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = (auth.jwt()->>'user_id')::integer));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_date ON analytics_events(organization_id, event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_org ON analytics_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON analytics_dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_dataset ON training_samples(dataset_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_model_versions_module ON ai_model_versions(ai_module);
CREATE INDEX IF NOT EXISTS idx_model_deployments_status ON model_deployments(status);
