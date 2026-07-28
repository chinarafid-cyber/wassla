"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "@/i18n/context";
import { apiPost, ApiError } from "../lib/api-client";
import { otpRequestSchema, type OtpRequestInput } from "../schemas/otp.schema";

export function PhoneForm() {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OtpRequestInput>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { phone: "" },
  });

  async function onSubmit(values: OtpRequestInput) {
    setIsSubmitting(true);
    try {
      await apiPost("/api/v1/auth/otp/request", { phone: values.phone });
      router.push(`/verify?phone=${encodeURIComponent(values.phone)}`);
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof ApiError ? error.message : t.errors.networkError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.auth.login.phoneLabel}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder={t.auth.login.phonePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.phone ? t.errors.invalidPhone : undefined}
              </FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t.auth.login.submitting : t.auth.login.submit}
        </Button>
      </form>
    </Form>
  );
}
