interface OTPEmailOptions {
  otp: string;
  title: string;
  slogan?: string;
  desc: string;
  email: string;
}

export function generateOTPEmail({
  otp,
  title,
  slogan,
  desc,
  email,
}: OTPEmailOptions): string {
  const extractNameFromEmail = (email: string): string => {
    const localPart = email.split('@')[0];
    // Convert dots and underscores to spaces, then capitalize first letter of each word
    return localPart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const userName = extractNameFromEmail(email);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #3b82f6; padding: 40px 40px 30px; text-align: center;">
                            <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.15); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">${title}</h1>
                            ${slogan ? `<p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">${slogan}</p>` : ''}
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; letter-spacing: -0.3px;">Hello ${userName}!</h2>
                                <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">${desc}</p>
                            </div>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
                                <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
                                <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #1e293b; letter-spacing: 8px; margin: 8px 0;">${otp}</div>
                                <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">This code expires in 10 minutes</p>
                            </div>
                            
                            <!-- Instructions -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                                    <strong>Important:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">This verification was requested for ${email}</p>
                            <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email or contact support.</p>
                            
                            <!-- Social Links -->
                            <div style="margin: 24px 0 16px;">
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                            </div>
                            
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2024 Your Company Name. All rights reserved.<br>
                                123 Business Street, City, State 12345
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
