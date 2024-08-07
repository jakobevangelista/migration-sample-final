// import NextAuth from "next-auth";
// import authConfig from "@/auth.config";

// const { auth } = NextAuth(authConfig);
// const nextAuthMiddle = auth(function middleware(req) {
//   // custom middleware functions here
// });

// export default nextAuthMiddle;
// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const nextAuthMiddle = auth(function middleware(req) {
  // custom middleware functions here
});

export default clerkMiddleware(async (clerkauth, req) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await nextAuthMiddle(req); // works but needs AppRouteHandlerFnContext
  // console.log("CLERK MIDDLEWARE WORK");
  // console.log("req: ", req);
  // const res = await fetch(req);
  // const res = NextResponse.next();
  // await res;
  // const res = NextResponse.next();
  // res.headers.set("custom", "deeznuts");
  // console.log("should be after hit");

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
