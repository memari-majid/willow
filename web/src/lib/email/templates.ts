const BRAND = { primary: "#2563eb", text: "#1e293b", muted: "#64748b" };

function layout(body: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#f8fafc;color:${BRAND.text}">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">${body}</table>
</td></tr></table></body></html>`;
}

export function verificationEmail(params: {
  verifyUrl: string;
  name?: string | null;
  appName?: string;
}): { subject: string; html: string; text: string } {
  const app = params.appName ?? "Willow";
  const greeting = params.name ? `Hi ${params.name},` : "Hi,";
  const subject = `Verify your email — ${app}`;
  const html = layout(`
    <tr><td><h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.primary}">${app}</h1>
    <p style="margin:0 0 12px">${greeting}</p>
    <p style="margin:0 0 20px;color:${BRAND.muted}">Confirm your email to finish setting up your account.</p>
    <p style="margin:0 0 24px"><a href="${params.verifyUrl}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Verify email</a></p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted}">Link expires in 24 hours. If you did not sign up, ignore this email.</p></td></tr>`);
  const text = `${greeting}\n\nVerify your email: ${params.verifyUrl}\n\nLink expires in 24 hours.`;
  return { subject, html, text };
}

export function passwordResetEmail(params: {
  resetUrl: string;
  appName?: string;
}): { subject: string; html: string; text: string } {
  const app = params.appName ?? "Willow";
  const subject = `Reset your password — ${app}`;
  const html = layout(`
    <tr><td><h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.primary}">${app}</h1>
    <p style="margin:0 0 20px;color:${BRAND.muted}">We received a request to reset your password.</p>
    <p style="margin:0 0 24px"><a href="${params.resetUrl}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a></p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted}">Link expires in 1 hour. If you did not request this, ignore this email.</p></td></tr>`);
  const text = `Reset your password: ${params.resetUrl}\n\nLink expires in 1 hour.`;
  return { subject, html, text };
}
