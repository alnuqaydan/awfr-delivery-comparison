# AWFR - منصة مقارنة أسعار التوصيل الذكية

## 🚀 النشر على Render

### المتطلبات
- Node.js 18+
- npm أو yarn

### النشر المحلي
```bash
# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء المشروع
npm run build

# تشغيل في وضع الإنتاج
npm start
```

### النشر على Render

#### الطريقة الأولى: النشر التلقائي
1. اربط مستودع GitHub بـ Render
2. اختر "Web Service"
3. استخدم الإعدادات التالية:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

#### الطريقة الثانية: النشر باستخدام Docker
```bash
# بناء الصورة
docker build -t awfr-app .

# تشغيل الحاوية
docker run -p 3000:3000 awfr-app
```

### متغيرات البيئة
```env
NEXT_PUBLIC_APP_NAME=AWFR
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT=production
```

### الاختبارات
```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch

# تشغيل اختبارات E2E
npm run test:e2e
```

## 🏗️ البنية التقنية

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Material-UI
- **State Management:** Redux Toolkit
- **Testing:** Vitest + Playwright
- **Deployment:** Render

## 📊 الأداء

- ⚡ وقت التحميل الأولي: < 3 ثواني
- 📱 متوافق مع جميع الأجهزة
- 🔒 آمن ومحمي
- 🌍 يدعم اللغة العربية والإنجليزية

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.
