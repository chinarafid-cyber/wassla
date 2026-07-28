"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "@/i18n/context";
import { apiPost, ApiError } from "../lib/api-client";
import { completeProfileFormSchema, type CompleteProfileFormInput } from "../schemas/profile.schema";

const TICKET_STORAGE_KEY = "wassla_verification_ticket";

function subscribeToTicket() {
  return () => {};
}

function getTicketSnapshot() {
  return sessionStorage.getItem(TICKET_STORAGE_KEY);
}

function getServerTicketSnapshot() {
  return null;
}

export function CompleteProfileForm() {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Guards the redirect-away effect below from firing on our *own*
  // sessionStorage.removeItem() after a successful submit — without it,
  // clearing the ticket right before navigating to /dashboard races with
  // the "no ticket -> back to /login" check and can win.
  const [hasSucceeded, setHasSucceeded] = React.useState(false);

  // sessionStorage isn't available during SSR — useSyncExternalStore resolves
  // the client value after hydration without a setState-in-effect round trip.
  const ticket = React.useSyncExternalStore(
    subscribeToTicket,
    getTicketSnapshot,
    getServerTicketSnapshot,
  );

  React.useEffect(() => {
    if (ticket === null && !hasSucceeded) {
      router.replace("/login");
    }
  }, [ticket, hasSucceeded, router]);

  const form = useForm<CompleteProfileFormInput>({
    resolver: zodResolver(completeProfileFormSchema),
    defaultValues: { fullName: "", email: "" },
  });

  async function onSubmit(values: CompleteProfileFormInput) {
    if (!ticket) return;
    setIsSubmitting(true);
    try {
      await apiPost("/api/v1/auth/register", { ...values, verificationTicket: ticket });
      setHasSucceeded(true);
      sessionStorage.removeItem(TICKET_STORAGE_KEY);
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof ApiError ? error.message : t.errors.networkError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ticket) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.completeProfile.ticketMissing}
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.auth.completeProfile.fullNameLabel}</FormLabel>
              <FormControl>
                <Input placeholder={t.auth.completeProfile.fullNamePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.auth.completeProfile.emailLabel}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder={t.auth.completeProfile.emailPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t.auth.completeProfile.submitting : t.auth.completeProfile.submit}
        </Button>
      </form>
    </Form>
  );
}
