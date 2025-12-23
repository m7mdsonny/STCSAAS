# تغييرات Frontend Routes

## 📋 Routes الجديدة المضافة

يجب إضافة هذه Routes إلى `apps/web-portal/src/App.tsx`

### Owner Guide Route
```tsx
import { OwnerGuide } from './pages/OwnerGuide';

// داخل Layout route group
<Route 
  path="/guide" 
  element={
    <PrivateRoute>
      <OwnerGuide />
    </PrivateRoute>
  } 
/>
```

### Platform Wordings Route (Super Admin)
```tsx
import { PlatformWordings } from './pages/admin/PlatformWordings';

// داخل Super Admin routes
<Route path="/admin/wordings" element={<PlatformWordings />} />
```

---

## 📝 Sidebar Links

تم إضافة الروابط التالية في `apps/web-portal/src/components/layout/Sidebar.tsx`:

### Organization Links
```tsx
{ to: '/guide', icon: BookOpen, label: 'دليل المالك', roles: ['owner', 'admin'] },
```

### Super Admin Links
```tsx
{ to: '/admin/wordings', icon: Type, label: 'نصوص المنصة' },
```

---

## 📦 Imports المطلوبة

```tsx
import { BookOpen, Type } from 'lucide-react';
import { OwnerGuide } from './pages/OwnerGuide';
import { PlatformWordings } from './pages/admin/PlatformWordings';
```

