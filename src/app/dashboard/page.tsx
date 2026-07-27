import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">
        أهلاً بك، {user.email}
      </h1>
      <p className="text-gray-600">تسجيل الدخول يعمل بنجاح ✅</p>
      <LogoutButton />
    </main>
  );
}
