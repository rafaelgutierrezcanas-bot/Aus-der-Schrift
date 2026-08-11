"use client";

import { Analytics } from "@vercel/analytics/react";
import { useAnalyticsConsent } from "./CookieConsent";

export function ConditionalAnalytics() {
  const consent = useAnalyticsConsent();

  if (consent !== true) return null;
  return <Analytics />;
}
