export interface SendOtpEmailParams {
  toEmail: string;
  toName?: string;
  otpCode: string;
}

export async function sendOtpEmail({ toEmail, toName, otpCode }: SendOtpEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL || "sonkarsuraj447@gmail.com";

  if (!apiKey || !secretKey) {
    console.error("Mailjet API keys are missing in environment variables.");
    return { success: false, error: "Email service is not configured." };
  }

  const authHeader = "Basic " + Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #09090b;
          color: #f4f4f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 500px;
          margin: 40px auto;
          background: #141417;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 14px;
          color: #a1a1aa;
        }
        .otp-container {
          background: #1f1f23;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 28px 0;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #38bdf8;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }
        .info-text {
          font-size: 13px;
          color: #71717a;
          line-height: 1.6;
          text-align: center;
        }
        .footer {
          margin-top: 32px;
          border-top: 1px solid #27272a;
          padding-top: 16px;
          text-align: center;
          font-size: 12px;
          color: #52525b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">Email Verification</div>
          <div class="subtitle">Please use the code below to complete your verification</div>
        </div>
        
        <div class="otp-container">
          <div class="otp-code">${otpCode}</div>
        </div>
        
        <p class="info-text">
          This verification code is valid for <strong>10 minutes</strong>.<br>
          If you did not request this email, please safely ignore it.
        </p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Shursunt Trading. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: "Shursunt Verification",
            },
            To: [
              {
                Email: toEmail,
                Name: toName || toEmail,
              },
            ],
            Subject: `${otpCode} is your email verification code`,
            TextPart: `Your email verification code is: ${otpCode}. This code will expire in 10 minutes.`,
            HTMLPart: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mailjet API Error:", response.status, errorText);
      return { success: false, error: `Mailjet returned status ${response.status}` };
    }

    const data = await response.json();
    const messageStatus = data?.Messages?.[0]?.Status;
    if (messageStatus === "success") {
      return { success: true };
    } else {
      console.warn("Mailjet response status issue:", data);
      return { success: true }; // HTTP 200 returned
    }
  } catch (err: any) {
    console.error("Failed to send email via Mailjet:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}
