# وصلة (Wassla)

منصة ويب تربط أصحاب العلامات التجارية بصناع المحتوى (المؤثرين) لإنشاء حملات إعلانية، مقابل عمولة نسبة مئوية من كل حملة.

**الحالة الحالية:** Phase 1 — وحدة **AUTH-001** (مصادقة برقم الهاتف + OTP) مكتملة.

## التشغيل محليًا

### المتطلبات
- Node.js 20.9+
- Docker Desktop (لتشغيل PostgreSQL وRedis)

### الخطوات

```bash
npm install

cp .env.example .env
cp .env.local.example .env.local
# عدّل .env و.env.local بكلمات مرور/أسرار حقيقية

docker compose up -d postgres redis
docker compose run --rm migrate

npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

في وضع التطوير، أكواد OTP تُطبع في سجلات السيرفر (`console` SMS provider) بدل إرسالها فعليًا — راجع `SMS_PROVIDER` في `.env.local`.

## الاختبارات

```bash
npm run test        # Vitest — اختبارات وحدة
npm run test:e2e    # Playwright — اختبارات شاملة (يحتاج docker compose up -d قيد التشغيل)
```

## البنية التقنية

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui |
| المصادقة | رقم هاتف + OTP · JWT (access قصير + refresh مُدوَّر) · كوكيز HttpOnly |
| قاعدة البيانات | PostgreSQL عبر Prisma ORM |
| التخزين المؤقت | Redis (rate limiting، cooldown) |
| البنية التحتية | Docker · Docker Compose |
| الاختبارات | Vitest (وحدة) · Playwright (E2E) |

راجع [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) لشرح تفصيلي لكل قرار تقني.

## البريد الإلكتروني القديم / Supabase

النسخة الأولى من المشروع كانت مبنية على Supabase (بريد + كلمة مرور). تم استبدالها بالكامل بنظام هاتف/OTP الحالي — راجع تاريخ Git إذا احتجت الرجوع لتلك النسخة.
