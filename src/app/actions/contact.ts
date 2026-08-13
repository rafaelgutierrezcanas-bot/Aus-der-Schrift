"use server";

import { Resend } from "resend";

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const { name, email, subject, message } = data;

  if (!name || !email || !subject || !message) {
    return { success: false, error: "Alle Felder sind erforderlich." };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return { success: false, error: "Server-Konfigurationsfehler." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `Theologik Kontakt <${process.env.RESEND_FROM_EMAIL || "kontakt@theologik.org"}>`,
      to: "info@theologik.org",
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: "Nachricht konnte nicht gesendet werden." };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, error: "Nachricht konnte nicht gesendet werden." };
  }
}
