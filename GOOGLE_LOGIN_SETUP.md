# تفعيل تسجيل الدخول بـ Google

الزر ظاهر في نافذة «إنشاء حساب / تسجيل الدخول» بس لازم تفعّله من Supabase وGoogle مرة واحدة.

## 1) Supabase — فعّل مزوّد Google
1. افتح مشروعك → **Authentication** → **Providers** → **Google**.
2. فعّل **Enable Sign in with Google**.
3. سيب النافذة مفتوحة (هتحط فيها الـ Client ID والـ Secret في الخطوة 3).

## 2) Google Cloud — اعمل OAuth Client
1. افتح https://console.cloud.google.com/apis/credentials
2. اختر مشروع (أو اعمل مشروع جديد).
3. **+ CREATE CREDENTIALS** → **OAuth client ID**.
4. لو طلب «Configure consent screen» → اعمله: External → املأ الاسم والإيميل → Save.
5. في إنشاء الـ Client:
   - **Application type**: Web application
   - **Name**: الدولة الجروبية
   - **Authorized redirect URIs** → أضف:
     ```
     https://rtozooissujwazafwqzc.supabase.co/auth/v1/callback
     ```
6. اضغط **CREATE** → انسخ **Client ID** و **Client secret**.

## 3) ارجع لـ Supabase
الصق **Client ID** و **Client secret** في مزوّد Google → **Save**.

## 4) سمح بالـ Redirect (مهم جداً)
في Supabase: **Authentication** → **URL Configuration** → **Redirect URLs** → أضف:
```
http://localhost:8000/**
http://127.0.0.1:8123/**
https://al-dawla-al-jurubiya.vercel.app/**
```
(بدّل رابط Vercel بالرابط الحقيقي بتاعك) → **Save**.

## 5) جرّبه
افتح الموقع → «إنشاء حساب جديد» → **المتابعة بـ Google** → اختر حسابك → هترجع للموقع مسجّل دخول ✅

أول شخص يسجّل بـ Google يبقى **مالك الدولة**.

## ملاحظات
- لو طلع `Error 400: redirect_uri_mismatch` → راجع خطوة 2 (الـ redirect URI لازم يطابق بالحرف).
- لو طلع `403` → راجع خطوة 4 (Redirect URLs في Supabase).
- تسجيل البريد/كلمة المرور شغّال عادي جنب Google، مش اتلغى.
