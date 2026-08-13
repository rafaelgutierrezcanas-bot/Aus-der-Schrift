import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars
  checks.hasResendKey = !!process.env.RESEND_API_KEY;
  checks.keyPrefix = process.env.RESEND_API_KEY?.substring(0, 6) ?? "MISSING";
  checks.fromEmail = process.env.RESEND_FROM_EMAIL ?? "MISSING";

  // 2. Try sending a test email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: `Theologik Kontakt <${process.env.RESEND_FROM_EMAIL || "kontakt@theologik.org"}>`,
        to: "info@theologik.org",
        subject: "[Debug] Contact form test from Vercel",
        text: "This is a test email to verify the contact form works on Vercel.",
      });

      if (error) {
        checks.resendError = error;
        checks.sendSuccess = false;
      } else {
        checks.emailId = data?.id;
        checks.sendSuccess = true;
      }
    } catch (err) {
      checks.sendSuccess = false;
      checks.exception = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(checks);
}
