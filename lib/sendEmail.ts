import "dotenv/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { Resend } from 'resend';

const resendAPi = process.env.RESEND_API_KEY!;
const resend = new Resend(resendAPi);


interface SendEmailOptions {
	to: string;
	subject: string;
	html?: string;
	text?: string;
}



export async function sendEmailWithResend({ to, subject, html, text }: SendEmailOptions) { 
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html: html as string,
    text: text as string,
  });
  
  console.log(data, error);

  return data 
}

const mailerSend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY!,
});

const sentFrom = new Sender("noreply@test-86org8ekok0gew13.mlsender.net", "Budgety");



export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
	try {
		const recipients = [new Recipient(to, to)];

		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(recipients)
			.setReplyTo(sentFrom)
			.setSubject(subject);

		if (html) {
			emailParams.setHtml(html);
		}

		if (text) {
			emailParams.setText(text);
		}

		const response = await mailerSend.email.send(emailParams);
		console.log("Email sent successfully:", response);
		return response;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
	const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #4F46E5;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #4338CA;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
          .link {
            word-break: break-all;
            color: #4F46E5;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Budgety</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please verify your email address to complete your registration and start using Budgety.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with Budgety, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Budgety. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

	const textContent = `
    Budgety - Verify Your Email Address
    
    Thank you for signing up! Please verify your email address to complete your registration.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    This link will expire in 1 hour.
    
    If you didn't create an account with Budgety, you can safely ignore this email.
    
    © ${new Date().getFullYear()} Budgety. All rights reserved.
  `;

	return sendEmailWithResend({
		to: email,
		subject: "Verify Your Email Address - Budgety",
		html: htmlContent,
		text: textContent,
	});
}

export async function sendOTPEmail(
	email: string,
	otp: string,
	type: "sign-in" | "email-verification" | "forget-password"
) {
	let subject = "";
	let heading = "";
	let message = "";

	switch (type) {
		case "sign-in":
			subject = "Your Sign-In Code - Budgety";
			heading = "Sign In to Your Account";
			message = "Use this code to sign in to your Budgety account:";
			break;
		case "email-verification":
			subject = "Your Email Verification Code - Budgety";
			heading = "Verify Your Email";
			message = "Use this code to verify your email address:";
			break;
		case "forget-password":
			subject = "Your Password Reset Code - Budgety";
			heading = "Reset Your Password";
			message = "Use this code to reset your password:";
			break;
	}

	const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            text-align: center;
            letter-spacing: 8px;
            padding: 20px;
            background-color: #f3f4f6;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Budgety</h1>
          </div>
          <div class="content">
            <h2>${heading}</h2>
            <p>${message}</p>
            <div class="otp-code">${otp}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Budgety. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

	const textContent = `
    Budgety - ${heading}
    
    ${message}
    
    Your code: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
    
    © ${new Date().getFullYear()} Budgety. All rights reserved.
  `;

	return sendEmail({
		to: email,
		subject,
		html: htmlContent,
		text: textContent,
	});
}
