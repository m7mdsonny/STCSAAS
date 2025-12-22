// التعديلات على ملف: apps/web-portal/src/pages/admin/Plans.tsx
// الجزء المعدل فقط - دالة saveEdit

  const saveEdit = async () => {
    if (!editingPlan) return;
    try {
      await settingsApi.updatePlan(editingPlan, editForm);
      setEditingPlan(null);
      setEditForm({});
      await fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في حفظ الباقة');
    }
  };

