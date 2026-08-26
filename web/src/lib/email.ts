import { passwordResetEmail, verificationEmail } from "@/lib/email/templates";
import { publicAppUrl } from "@/lib/app-url";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id?: string } | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return null;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend error ${res.status}: ${errBody}`);
  }

  try {
    const json = (await res.json()) as { id?: string };
    return { id: json.id };
  } catch {
    return {};
  }
}

export async function sendVerificationEmail(params: {
  to: string;
  token: string;
  name?: string | null;
}): Promise<{ id?: string } | null> {
  const base = publicAppUrl();
  const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(params.token)}`;
  const { subject, html, text } = verificationEmail({ verifyUrl, name: params.name });
  return sendEmail({ to: params.to, subject, html, text });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
}): Promise<{ id?: string } | null> {
  const base = publicAppUrl();
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(params.token)}`;
  const { subject, html, text } = passwordResetEmail({ resetUrl });
  return sendEmail({ to: params.to, subject, html, text });
}
