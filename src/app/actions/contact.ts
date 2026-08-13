"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  try {
    await resend.emails.send({
      from: `Theologik Kontakt <${process.env.RESEND_FROM_EMAIL || "kontakt@theologik.org"}>`,
      to: "info@theologik.org",
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, error: "Nachricht konnte nicht gesendet werden." };
  }
}
