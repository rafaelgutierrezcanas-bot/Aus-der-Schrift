import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    resendKey: !!process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM_EMAIL ?? "MISSING",
    sanityId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    adminSecret: !!process.env.ADMIN_SECRET,
    nodeEnv: process.env.NODE_ENV,
    allResendKeys: Object.keys(process.env).filter(k => k.includes("RESEND")),
  });
}
