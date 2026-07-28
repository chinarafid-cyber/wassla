"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "@/i18n/context";
import { formatMessage } from "@/i18n/get-dictionary";
import { apiPost, ApiError } from "../lib/api-client";
import { OTP_LENGTH, OTP_EXPIRY_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from "@/config/constants";

export function OtpForm({ phone }: { phone: string }) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  const [digits, setDigits] = React.useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [expiresIn, setExpiresIn] = React.useState(OTP_EXPIRY_SECONDS);
  const [resendIn, setResendIn] = React.useState(OTP_RESEND_COOLDOWN_SECONDS);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setExpiresIn((s) => Math.max(s - 1, 0));
      setResendIn((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetDigits = React.useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }, []);

  async function submitCode(code: string) {
    setIsSubmitting(true);
    try {
      const result = await apiPost<{ ticket: string; isNewUser: boolean }>(
        "/api/v1/auth/otp/verify",
        { phone, code },
      );

      if (result.isNewUser) {
        sessionStorage.setItem("wassla_verification_ticket", result.ticket);
        router.push("/complete-profile");
        return;
      }

      await apiPost("/api/v1/auth/login", { verificationTicket: result.ticket });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof ApiError ? error.message : t.errors.networkError,
      });
      resetDigits();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await apiPost("/api/v1/auth/otp/request", { phone });
      setExpiresIn(OTP_EXPIRY_SECONDS);
      setResendIn(OTP_RESEND_COOLDOWN_SECONDS);
      resetDigits();
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof ApiError ? error.message : t.errors.networkError,
      });
    } finally {
      setIsResending(false);
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === OTP_LENGTH - 1) {
      const code = digits.map((d, i) => (i === index ? digit : d)).join("");
      if (code.length === OTP_LENGTH) void submitCode(code);
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);

    if (pasted.length === OTP_LENGTH) {
      void submitCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  const code = digits.join("");

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2" dir="ltr">
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="h-12 w-10 text-center text-lg"
            disabled={isSubmitting}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {expiresIn > 0
          ? formatMessage(t.auth.verify.expiresIn, { seconds: expiresIn })
          : t.auth.verify.expired}
      </p>

      <Button
        className="w-full"
        disabled={code.length !== OTP_LENGTH || isSubmitting}
        onClick={() => submitCode(code)}
      >
        {isSubmitting ? t.auth.verify.submitting : t.auth.verify.submit}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={resendIn > 0 || isResending}
        onClick={handleResend}
      >
        {resendIn > 0
          ? formatMessage(t.auth.verify.resendIn, { seconds: resendIn })
          : t.auth.verify.resend}
      </Button>
    </div>
  );
}
