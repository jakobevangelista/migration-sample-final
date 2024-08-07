import { NextResponse } from "next/server";

export async function sendHeartBeat(userId: string, token: string) {
  // return async () => {
  // console.log("marking user active: ", userId, token);

  // const res = await fetch("http://localhost:8080/add-stale-users", {

  const res = await fetch("http://localhost:8080/add-active-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
    body: JSON.stringify({ id: userId, token }),
  });

  // console.log("ACTIVE USER MARKED");
  const data = await res.json();

  return new Response(JSON.stringify({ data }), { status: res.status }); // change status to res.status or whatever indicates sign in

  // which can either be "set active" or signInToken
  // if setactive, nothing
  // if signintoken, sign them in on client in background
  // };
}
