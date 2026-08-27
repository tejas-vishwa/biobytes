import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

const apiKey = process.env.MAILERSEND_API_KEY || ""
const mailerSend = new MailerSend({ apiKey })

export interface MagicLinkEmailParams {
  to: string
  url: string
  host: string
}

/**
 * Clean & Professional HTML Magic Link Template for QURIX / BioBytes
 */
export function generateMagicLinkHtml({ url, host }: { url: string; host: string }): string {
  const brandColor = "#059669"
  const buttonTextColor = "#ffffff"

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to QURIX BioBytes</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700;">QURIX BioBytes</h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Secure Passwordless Sign-In</p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="color: #334155; font-size: 16px; line-height: 24px; padding-bottom: 28px; text-align: center;">
              Click the button below to authenticate your account and securely sign in to <strong>${host}</strong>.
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${url}" target="_blank" style="display: inline-block; background-color: ${brandColor}; color: ${buttonTextColor}; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                Sign In to BioBytes
              </a>
            </td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 20px; color: #64748b; font-size: 13px; line-height: 20px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${url}" style="color: ${brandColor}; word-break: break-all; text-decoration: underline;">${url}</a>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 18px; text-align: center;">
              If you didn't request this sign-in link, you can safely ignore this email. This link will expire in 24 hours.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Sends a passwordless sign-in magic link using MailerSend Node SDK
 */
export async function sendMagicLinkEmail({ to, url, host }: MagicLinkEmailParams): Promise<void> {
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "noreply@qurix.health"
  const fromName = process.env.MAILERSEND_FROM_NAME || "QURIX BioBytes"

  if (!process.env.MAILERSEND_API_KEY) {
    console.warn("MAILERSEND_API_KEY is not configured. Magic link URL for local development:", url)
    return
  }

  const sentFrom = new Sender(fromEmail, fromName)
  const recipients = [new Recipient(to, to)]

  const emailHtml = generateMagicLinkHtml({ url, host })
  const emailText = `Sign in to QURIX BioBytes (${host})\n\nClick the link below to sign in:\n${url}\n\nIf you did not request this email, you can safely ignore it.`

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(`Your Magic Sign-In Link for QURIX BioBytes`)
    .setHtml(emailHtml)
    .setText(emailText)

  await mailerSend.email.send(emailParams)
}

/**
 * Clean & High-Contrast HTML OTP Email Template for QURIX / BioBytes
 */
export function generateOtpHtml({ otp }: { otp: string }): string {
  const brandColor = "#059669"

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your BioBytes Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 20px;">
              <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700;">QURIX BioBytes</h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Email Verification Code</p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="color: #334155; font-size: 15px; line-height: 22px; padding-bottom: 24px;">
              Please use the verification code below to verify your email address and complete your account creation:
            </td>
          </tr>

          <!-- OTP Display Box -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed ${brandColor}; border-radius: 12px; padding: 16px 36px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: ${brandColor}; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="color: #64748b; font-size: 13px; line-height: 20px; padding-bottom: 20px;">
              This code will expire in <strong>10 minutes</strong>. If you did not initiate this request, you can safely ignore this message.
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 18px;">
              Never share this verification code with anyone. BioBytes staff will never ask for your code.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Sends a 6-digit OTP verification code via MailerSend Node SDK
 */
export async function sendOtpEmail({ to, otp }: { to: string; otp: string }): Promise<void> {
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "noreply@qurix.health"
  const fromName = process.env.MAILERSEND_FROM_NAME || "QURIX BioBytes"

  if (!process.env.MAILERSEND_API_KEY) {
    console.log(`[DEV OTP NOTIFICATION] 6-digit OTP for ${to}: ${otp}`)
    return
  }

  const sentFrom = new Sender(fromEmail, fromName)
  const recipients = [new Recipient(to, to)]

  const emailHtml = generateOtpHtml({ otp })
  const emailText = `Your QURIX BioBytes verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share this code with anyone.`

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(`${otp} is your QURIX BioBytes Verification Code`)
    .setHtml(emailHtml)
    .setText(emailText)

  await mailerSend.email.send(emailParams)
}
