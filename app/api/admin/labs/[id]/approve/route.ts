import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
const nodemailer = require("nodemailer")

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: labId } = await params

    // Update the lab's status
    const updatedLab = await prisma.labPartner.update({
      where: { id: labId },
      data: {
        accountStatus: "active",
        isActive: true
      }
    })

    // Fire welcome email via nodemailer
    if (updatedLab.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "qurix.biobytes@gmail.com",
          pass: process.env.EMAIL_PASS, // Needs to be configured in .env
        },
      })

      const mailOptions = {
        from: "qurix.biobytes@gmail.com",
        to: updatedLab.email,
        subject: "Welcome to the QURIX Lab Partner Network!",
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Application Approved!</h2>
            <p>Dear ${updatedLab.contactPerson || "Partner"},</p>
            <p>We are thrilled to welcome <strong>${updatedLab.name}</strong> to the QURIX network.</p>
            <p>Your lab's onboarding application has been verified and your account is now <strong>active</strong>.</p>
            <p>You can now log into your dashboard using the email and password you provided during registration.</p>
            <br />
            <p>Best Regards,</p>
            <p><strong>The QURIX Team</strong></p>
          </div>
        `,
      }

      // Send email (fire and forget for this route, or await)
      await transporter.sendMail(mailOptions).catch((err: unknown) => {
        console.error("Failed to send welcome email:", err)
      })
    }

    return NextResponse.json({ success: true, lab: updatedLab })
  } catch (error: any) {
    console.error("Error approving lab:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
