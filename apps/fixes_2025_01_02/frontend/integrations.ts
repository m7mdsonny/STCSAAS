// التعديلات على ملف: apps/web-portal/src/lib/api/integrations.ts
// الجزء المعدل فقط - interface CreateIntegrationData

interface CreateIntegrationData {
  name: string;
  organization_id: string;  // ✅ تمت الإضافة
  edge_server_id: string;
  type: IntegrationType;
  connection_config: Record<string, unknown>;
}

