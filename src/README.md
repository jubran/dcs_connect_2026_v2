# هيكل مشروع DCS Connect 2026

## نظرة عامة

تم إعادة هيكلة المشروع من **510 ملف** موزعة في 3 نسخ متكررة (`myApp/` + `features/` + `shared/`) إلى **369 ملف** في هيكل واضح وموحد.

---

## هيكل `src/`

```
src/
├── app.jsx              ← نقطة دخول التطبيق
├── main.jsx             ← تهيئة React DOM
├── config-global.js     ← الإعدادات العامة (API URL, paths)
│
├── auth/                ← نظام المصادقة (JWT)
│   ├── context/jwt/     ← AuthProvider, AuthContext, utils
│   ├── guard/           ← AuthGuard, GuestGuard, RoleGuard
│   └── hooks/           ← useAuthContext
│
├── components/          ← مكونات UI عامة قابلة لإعادة الاستخدام
│   ├── animate/         ← Framer Motion variants
│   ├── hook-form/       ← RHF wrappers (RhfTextField, RhfSelect...)
│   ├── settings/        ← لوحة إعدادات الثيم
│   ├── nav-section/     ← قائمة التنقل (vertical/mini/horizontal)
│   └── ...              ← label, iconify, scrollbar, dialog, etc.
│
├── features/            ← ✅ كل ميزة مستقلة بمكوناتها ومنطقها
│   ├── auth/            ← صفحات تسجيل الدخول والتسجيل
│   ├── dashboard/       ← الصفحة الرئيسية (حالة المحطة + الأحداث)
│   │   └── components/  ← PlantStatus, EventsView, OperationDialog...
│   ├── operations/      ← نماذج العمليات الفنية
│   │   ├── forms/       ← نماذج منفصلة (units, tank, transformer, bsde)
│   │   └── shared/      ← منطق مشترك بين النماذج
│   ├── sequences/       ← إدارة أولويات التشغيل (Drag & Drop)
│   │   ├── components/  ← مكونات Sequence
│   │   ├── hooks/       ← useSequenceManager, useDragAndDrop...
│   │   ├── services/    ← API calls
│   │   └── utils/       ← helpers, normalizer, restrict
│   ├── search/          ← البحث في الأحداث والسيارات
│   ├── notifications/   ← الإشعارات
│   └── error/           ← صفحات 404, 403, 500
│
├── layouts/             ← قوالب الصفحات
│   ├── dashboard/       ← Layout الداشبورد (Header + Nav + Main)
│   ├── auth/            ← Layout صفحات تسجيل الدخول
│   └── common/          ← مكونات مشتركة (Searchbar, Notifications...)
│
├── locales/             ← الترجمة (AR/EN) + i18n config
│
├── routes/              ← تعريف المسارات
│   ├── sections/        ← auth.jsx, dashboard.jsx, main.jsx
│   ├── hooks/           ← useRouter, usePathname...
│   └── paths.js         ← ثوابت المسارات
│
├── shared/              ← ✅ مشتركات التطبيق (مكان واحد فقط)
│   ├── components/      ← EmptyState, ErrorState, LoadingState, SysButton
│   ├── contexts/        ← SnackbarContext
│   ├── hooks/           ← useBoolean, useResponsive, useScrollToTop...
│   └── utils/           ← axios, API_ROUTES, format-time, tankUtils...
│
└── theme/               ← تخصيص MUI Theme (palette, typography, overrides)
```

---

## قواعد الاستيراد

| المصدر | مسار الاستيراد |
|--------|---------------|
| مكونات UI عامة | `src/components/...` |
| مشتركات التطبيق | `src/shared/components`, `src/shared/hooks`, `src/shared/utils` |
| ميزة محددة | `src/features/[feature]/...` |
| نظام المصادقة | `src/auth/...` |
| الثيم | `src/theme` |
| المسارات | `src/routes/paths` |

---

## ملاحظات مهمة للتطوير

1. **أضف ميزة جديدة** → أنشئ مجلداً في `features/` بنفس هيكل المجلدات الموجودة
2. **مكون يُستخدم في ميزتين** → انقله إلى `shared/components/`
3. **hook مشترك** → ضعه في `shared/hooks/`
4. **API endpoint جديد** → أضفه في `shared/utils/API_ROUTES.js`
5. **لا تستورد من `myApp/`** → تم حذف هذا المجلد نهائياً

