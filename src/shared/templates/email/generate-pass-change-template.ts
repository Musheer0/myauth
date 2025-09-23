interface PasswordChangeEmailOptions {
  email: string;
}

export function generatePasswordChangeEmail({
  email,
}: PasswordChangeEmailOptions): string {
  const extractNameFromEmail = (email: string): string => {
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const userName = extractNameFromEmail(email);

  const title = 'Password Changed Successfully';
  const desc =
    'This is a confirmation that your account password was changed. If this wasn’t you, secure your account immediately.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:600px;background:#fff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#3b82f6;padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:600;">${title}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;text-align:center;">
              <h2 style="margin:0 0 16px;color:#1e293b;font-size:24px;font-weight:600;">Hello ${userName}!</h2>
              <p style="margin:0;color:#64748b;font-size:16px;line-height:1.6;">${desc}</p>

              <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:32px 0;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#92400e;font-size:14px;font-weight:500;">
                  <strong>Important:</strong> If this wasn’t you, <a href="https://yourapp.com/reset-password" style="color:#3b82f6;">reset your password</a> immediately or contact support.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 16px;color:#64748b;font-size:14px;">This change was associated with ${email}</p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">© 2024 Your Company. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
