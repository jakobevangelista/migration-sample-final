import { auth } from "@/auth";
import { db } from "@/server/neonDb";
import { users } from "@/server/neonDb/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function getUserIdFromSession() {
  const session = await auth();
  const user = await db.query.users.findFirst({
    where: eq(users.email, session!.user!.email!),
  });

  return user!.id;
}

export const POST = async (req: NextRequest) => {
  const userId = await getUserIdFromSession();

  const res = await fetch("http://localhost:3001/api/addactiveuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
    body: JSON.stringify({ id: userId }),
  });
  const data = await res.json();

  return new NextResponse(JSON.stringify({ data }), { status: res.status });
  // which can either be "set active" or signInToken
  // if setactive, nothing
  // if signintoken, sign them in on client in background
};
