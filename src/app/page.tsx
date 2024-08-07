import { auth, signOut } from "@/auth";
import { db } from "@/server/neonDb";
import { userAttributes, users } from "@/server/neonDb/schema";
import { eq } from "drizzle-orm";

import { redirect } from "next/navigation";
import TestFetchComponent from "./testFetchComponent";

export default async function Home() {
  const session = await auth();
  if (session === null) {
    return redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email!),
  });

  const userAttribute = await db.query.userAttributes.findFirst({
    where: eq(userAttributes.userId, user?.id!),
  });

  return (
    <>
      <div>Signed In with Next-Auth</div>
      <div>{JSON.stringify(session)}</div>
      <div>Special Attribute: {userAttribute?.attribute}</div>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
      <form
        action={async () => {
          "use server";

          const res = await fetch("http://localhost:3003/api/getUsersByIds", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ids: [
                "0d0cffc1-319f-43c9-b4ea-f3f995dc806b",
                "0d6f1cea-01b1-4da2-8a67-35007d28607b",
              ],
            }),
          });

          const data = await res.json();

          console.log("GET USERS BY IDS: ", data);
        }}
      >
        <button type="submit">Hit Get USers By ids</button>
      </form>
      <TestFetchComponent />
    </>
  );
}
