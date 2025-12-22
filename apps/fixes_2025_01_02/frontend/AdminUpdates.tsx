// التعديلات على ملف: apps/web-portal/src/pages/admin/AdminUpdates.tsx
// الأجزاء المعدلة:

// 1. تحديث createUpdate
  const createUpdate = async () => {
    if (!form.title || !form.title.trim()) {
      alert('يرجى إدخال عنوان التحديث');
      return;
    }
    setSaving(true);
    try {
      await updatesApi.create(form);
      setForm({ title: '', body: '', organization_id: null, is_published: false });
      await fetchAll();
    } catch (error) {
      console.error('Error creating update', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في إنشاء التحديث');
    } finally {
      setSaving(false);
    }
  };

// 2. تحديث togglePublish
  const togglePublish = async (id: number) => {
    try {
      await updatesApi.toggle(id);
      await fetchAll();
    } catch (error) {
      console.error('Error toggling publish', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في تغيير حالة النشر');
    }
  };

// 3. تحديث removeUpdate
  const removeUpdate = async (id: number) => {
    if (!confirm('حذف التحديث؟')) return;
    try {
      await updatesApi.remove(id);
      await fetchAll();
    } catch (error) {
      console.error('Error removing update', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في حذف التحديث');
    }
  };

