// التعديلات على ملف: apps/web-portal/src/pages/admin/Organizations.tsx
// الجزء المعدل فقط - دالة handleSubmit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم المؤسسة');
      return;
    }

    try {
      // Ensure subscription_plan is set
      const submitData = {
        ...formData,
        subscription_plan: formData.subscription_plan || 'basic',
      };

      if (editingOrg) {
        await organizationsApi.updateOrganization(editingOrg.id, submitData);
        setEditingOrg(null);
      } else {
        await organizationsApi.createOrganization(submitData);
      }
      await fetchOrganizations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في حفظ المؤسسة';
      alert(errorMessage);
    }
  };

