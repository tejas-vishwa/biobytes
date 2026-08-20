import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Ensure we run dynamically without caching
export const dynamic = 'force-dynamic'

// Note: To use Gmail, you must configure an App Password
// https://myaccount.google.com/apppasswords
const EMAIL_USER = process.env.EMAIL_USER || "qurix.biobytes@gmail.com"
const EMAIL_PASS = process.env.EMAIL_PASS || "" // User needs to provide this in .env

export async function GET(request: Request) {
  // Simple cron job that runs every hour (e.g. from Vercel or a scheduler)
  // It checks for reminders that match the current hour
  
  // Basic security: allow a secret cron token
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get current time in HH:00 format
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const currentHourTime = `${hours}:00`

    // Find all active reminders that match the current hour
    // (In a real production app, we'd probably use a more robust queueing system, but this works for basic cron)
    const remindersToProcess = await prisma.medicineReminder.findMany({
      where: {
        isActive: true,
        // Match only the hour part if users select times like 08:00
        reminderTime: {
          startsWith: `${hours}:`
        }
      },
      include: {
        patient: true
      }
    })

    if (remindersToProcess.length === 0) {
      return NextResponse.json({ message: "No reminders to send for this hour", count: 0 })
    }

    if (!EMAIL_PASS) {
      console.warn("EMAIL_PASS not configured. Cannot send real emails.")
      return NextResponse.json({ 
        message: "Email credentials not configured. Reminders found but not sent.", 
        count: remindersToProcess.length 
      })
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })

    let successCount = 0
    let failCount = 0

    // Send emails
    for (const reminder of remindersToProcess) {
      if (!reminder.patient.email) continue

      try {
        const mailOptions = {
          from: `"Qurix BioBytes" <${EMAIL_USER}>`,
          to: reminder.patient.email,
          subject: `Reminder: Time to take your medicine (${reminder.medicineName})`,
          text: `Hello ${reminder.patient.name || 'Patient'},\n\nThis is your scheduled reminder to take your medicine:\n\nMedicine: ${reminder.medicineName}\nTime: ${reminder.reminderTime}\n\nStay healthy!\n- The Qurix BioBytes Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #0f172a;">Qurix BioBytes Health Reminder</h2>
              <p>Hello ${reminder.patient.name || 'Patient'},</p>
              <p>This is your scheduled reminder to take your medicine.</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>Medicine:</strong> ${reminder.medicineName}</p>
                <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Scheduled Time:</strong> ${reminder.reminderTime}</p>
              </div>
              <p style="color: #64748b; font-size: 14px;">Stay healthy!</p>
            </div>
          `,
        }

        await transporter.sendMail(mailOptions)
        successCount++
      } catch (e) {
        console.error(`Failed to send email to ${reminder.patient.email}:`, e)
        failCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${remindersToProcess.length} reminders`,
      sent: successCount,
      failed: failCount
    })

  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
