import { sendHeartBeat } from "@/app/_auth-migration/sendHeartBeatRoute";
import { auth } from "@/auth";
import { db } from "@/server/neonDb";
import { users } from "@/server/neonDb/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

async function getUserIdFromSession() {
  const session = await auth();
  const user = await db.query.users.findFirst({
    where: eq(users.email, session!.user!.email!),
  });

  return user!.id;
}
export const POST = async (req: NextRequest) => {
  const userId = await getUserIdFromSession();
  const body = await req.formData();
  const token = body.get("token"); // add the token to to the fetch when the api is fixed

  return await sendHeartBeat(userId, token as string);
};

// code below is in src/app/_auth-migration/sendHeartBeatRoute.ts
// export const POST = async (req: NextRequest) => {
//   const userId = await getUserIdFromSession();
//   const body = await req.formData();
//   console.log(body.get("token"));
//   const token = body.get("token"); // add the token to to the fetch when the api is fixed

//   // console.log("marking user active: ", userId);
//   // return new Response("User already exists", { status: 202 });
//   // if (!userId) {
//   //   return new Response("User not signed into next auth", { status: 202 });
//   // }
//   // if(!userId && token) {
//   //   clerkClient.sig
//   // }
//   // const res = await fetch("http://localhost:8080/add-stale-users", {
//   const res = await fetch("http://localhost:8080/add-active-user", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
//     },
//     body: JSON.stringify({ id: userId, token }),
//   });
//   console.log("ACTIVE USER MARKED");
//   const data = await res.json();
//   console.log("DATA: ", data);

//   return new NextResponse(JSON.stringify({ data }), { status: res.status }); // change status to res.status or whatever indicates sign in
//   // which can either be "set active" or signInToken
//   // if setactive, nothing
//   // if signintoken, sign them in on client in background
// };
