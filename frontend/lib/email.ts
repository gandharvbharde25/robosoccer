import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

export async function sendAdvancementEmail(to: string, subject: string, body: string) {
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #0c0c0f; color: #e8e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: #13131a; border-left: 4px solid #e8ff3c; padding: 24px; margin-bottom: 24px; border-radius: 4px; }
        .header h1 { font-family: 'Arial Black', sans-serif; color: #e8ff3c; font-size: 28px; margin: 0 0 8px; letter-spacing: 2px; text-transform: uppercase; }
        .header p { color: #6b6b8a; margin: 0; font-size: 14px; }
        .content { background: #13131a; padding: 24px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #2a2a3a; }
        .content p { line-height: 1.7; color: #e8e8f0; font-size: 16px; }
        .footer { color: #6b6b8a; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚽ RoboSoccer</h1>
          <p>Tectonics — College Fest</p>
        </div>
        <div class="content">
          <p>${body.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the RoboSoccer Tournament System at Tectonics.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Tectonics RoboSoccer" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: body,
    html,
  });
}
