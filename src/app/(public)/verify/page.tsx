import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpForm } from "@/features/auth/components/otp-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  if (!phone) {
    redirect("/login");
  }

  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t.auth.verify.title}</CardTitle>
        <CardDescription>
          {t.auth.verify.subtitle} <span dir="ltr">{phone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OtpForm phone={phone} />
      </CardContent>
    </Card>
  );
}
