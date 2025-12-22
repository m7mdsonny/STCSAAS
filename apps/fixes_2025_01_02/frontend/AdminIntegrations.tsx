// التعديلات على ملف: apps/web-portal/src/pages/admin/AdminIntegrations.tsx
// الأجزاء المعدلة:

// 1. تحديث form state - حذف username/password وإضافة api_key/device_id
  const [form, setForm] = useState({
    organization_id: '',
    edge_server_id: '',
    name: '',
    type: 'http_rest' as Integration['type'],
    connection_config: {
      host: '',
      port: '',
      topic: '',
      endpoint: '',
      api_key: '',
      device_id: '',
    },
  });

// 2. تحديث resetForm
  const resetForm = () => {
    setForm({
      organization_id: '',
      edge_server_id: '',
      name: '',
      type: 'http_rest',
      connection_config: { host: '', port: '', topic: '', endpoint: '', api_key: '', device_id: '' },
    });
  };

// 3. تحديث getIntegrationConfig - حذف username/password
  const getIntegrationConfig = () => {
    switch (form.type) {
      case 'mqtt':
        return ['host', 'port', 'topic', 'api_key'];
      case 'http_rest':
        return ['endpoint', 'api_key'];
      case 'modbus_tcp':
        return ['host', 'port', 'device_id'];
      case 'tcp_socket':
        return ['host', 'port'];
      case 'arduino':
        return ['port', 'device_id'];
      case 'raspberry_gpio':
        return ['device_id'];
      default:
        return [];
    }
  };

// 4. تحديث addIntegration - إضافة validation و organization_id
  const addIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_id || !form.edge_server_id || !form.name.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await integrationsApi.createIntegration({
        name: form.name,
        type: form.type,
        organization_id: form.organization_id,
        edge_server_id: form.edge_server_id,
        connection_config: form.connection_config,
      });

      setShowModal(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Error creating integration:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في إنشاء التكامل');
    }
  };

