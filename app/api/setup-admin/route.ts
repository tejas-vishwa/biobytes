import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const setupSecret = process.env.ADMIN_SETUP_SECRET || process.env.CRON_SECRET;
    
    if (setupSecret && authHeader !== `Bearer ${setupSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = process.env.ADMIN_DEFAULT_EMAIL || "admin@teamqurix.com";
    const password = process.env.ADMIN_DEFAULT_PASSWORD || "BB@1234@QURIX";

    // Check if the admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // If the user exists but isn't an admin, let's upgrade them just in case
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" }
        });
        return NextResponse.json({ message: "Existing user upgraded to ADMIN successfully." });
      }
      return NextResponse.json({ message: "Admin account already exists and is configured correctly." });
    }

    // Create the new admin
    const passwordHash = await hash(password, 12);
    
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: email,
        passwordHash: passwordHash,
        role: "ADMIN"
      }
    });

    return NextResponse.json({ message: "Admin account created successfully!" });

  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Failed to set up admin account" }, { status: 500 });
  }
}
