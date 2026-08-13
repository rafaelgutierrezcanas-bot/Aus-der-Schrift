import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich." },
        { status: 400 },
      );
    }

    await resend.emails.send({
      from: `Theologik Kontakt <${process.env.RESEND_FROM_EMAIL || "kontakt@theologik.org"}>`,
      to: "info@theologik.org",
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Nachricht konnte nicht gesendet werden." },
      { status: 500 },
    );
  }
}
