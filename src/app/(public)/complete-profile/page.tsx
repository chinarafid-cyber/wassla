import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompleteProfileForm } from "@/features/auth/components/complete-profile-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function CompleteProfilePage() {
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t.auth.completeProfile.title}</CardTitle>
        <CardDescription>{t.auth.completeProfile.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <CompleteProfileForm />
      </CardContent>
    </Card>
  );
}
