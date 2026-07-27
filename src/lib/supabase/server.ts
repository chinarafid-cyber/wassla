import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// يُستخدم هذا الملف داخل مكوّنات السيرفر (Server Components, Route Handlers)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // يمكن تجاهل هذا الخطأ إذا استُدعيت الدالة من Server Component
            // لأن التحديث الفعلي للجلسة يتم عبر middleware.ts
          }
        },
      },
    }
  );
}
