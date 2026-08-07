import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const { id } = await context.params;

    if (!["SUSPEND", "ACTIVATE", "RESET_PASSWORD"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    let updatedUser;

    if (action === "SUSPEND") {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { accountStatus: "SUSPENDED" }
      });
      await prisma.activityLog.create({
        data: {
          action: "SUSPEND_USER",
          userId: session.user.id,
          details: `Target User ID: ${id}`
        }
      });
    } else if (action === "ACTIVATE") {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { accountStatus: "ACTIVE" }
      });
      await prisma.activityLog.create({
        data: {
          action: "ACTIVATE_USER",
          userId: session.user.id,
          details: `Target User ID: ${id}`
        }
      });
    } else if (action === "RESET_PASSWORD") {
      // Pretend email is sent
      await prisma.activityLog.create({
        data: {
          action: "RESET_PASSWORD_REQUEST",
          userId: session.user.id,
          details: `Target User ID: ${id}`
        }
      });
      return NextResponse.json({ message: "Password reset email sent" });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
