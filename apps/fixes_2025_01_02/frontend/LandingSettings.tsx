// التعديلات على ملف: apps/web-portal/src/pages/admin/LandingSettings.tsx
// الجزء المعدل فقط - دالة handleSave

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await settingsApi.updateLandingSettings({ ...form, published });
      setPublished(response.published);
      setSettings(response.content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

