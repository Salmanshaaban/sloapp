# TODO

## تم اكتشاف المشكلة
- Vercel config يوجّه `/api/*` إلى `api/index.ts`.
- لذلك تسجيل الدخول يتم عبر `api/index.ts` وليس عبر `backend/`.

## الخطوات المطلوبة لإصلاح “تسجيل الدخول” على Vercel
1. (اختياري) تأكيد الهدف:
   - هل نريد Vercel يشغل `backend/src/index.ts`؟
   - أم نريد تصحيح إعدادات `api/index.ts` فقط.
2. تعديل `vercel.json` إذا اخترنا تشغيل `backend/` بدل `api/`.
3. إن اخترنا `api/`:
   - ضبط Vercel Environment Variables: `ADMIN_EMAIL` و `ADMIN_PASSWORD` و `JWT_SECRET`.
   - أو إضافة مسار signup لتوليد admin/users داخل `api/index.ts`.
4. إعادة بناء/إعادة رفع “نسخة جديدة” على Vercel.
5. اختبار endpoints:
   - `POST /api/auth/login`
   - `GET /api/auth/profile` بعد تسجيل الدخول.

