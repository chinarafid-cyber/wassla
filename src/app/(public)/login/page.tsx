import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneForm } from "@/features/auth/components/phone-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function LoginPage() {
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t.auth.login.title}</CardTitle>
        <CardDescription>{t.auth.login.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <PhoneForm />
      </CardContent>
    </Card>
  );
}
