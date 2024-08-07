import { db } from "@/server/neonDb";
import { users } from "@/server/neonDb/schema";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const userIds = body.ids;

  const queriedUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, userIds));

  // const returnObject =
  return new NextResponse(
    JSON.stringify(
      queriedUsers.map((user) => ({
        external_id: user.id,
        email_address: [user.email],
        password: user.password,
        skip_password_checks: true,
        skip_password_requirement: true,
      }))
    )
  );
};
