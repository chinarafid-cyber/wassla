import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// يحدّث جلسة المستخدم في كل طلب حتى لا يتم تسجيل خروجه بشكل غير متوقع
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // قبل تعبئة مفاتيح Supabase في .env.local، نسمح للصفحة الرئيسية بالعمل
  // بدون تسجيل دخول بدل ما تظهر صفحة خطأ للمستخدم
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // يجب استدعاء getUser() هنا لتحديث الجلسة قبل أي شيء آخر
  await supabase.auth.getUser();

  return supabaseResponse;
}
