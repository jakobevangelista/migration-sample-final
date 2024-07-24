"use client";

import { UserButton, useSession, useSignIn, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
export default function ClerkMigrationTool({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();
  const { session } = useSession();
  const fetchRan = useRef<boolean>(false);
  const [signInId, setSignInId] = useState<string | null>(null);

  useEffect(() => {
    // gets the token from query and signs the user in
    if (!signIn || !setActive || session || signInId !== null) {
      return;
    }

    if (!fetchRan.current) {
      const createSignIn = async () => {
        console.log("here");
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: "testToken" }),
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        let data = null;
        data = await res.json();
        console.log("DATA: ", data);

        if (res.status === 222) {
          // 222 means the endpoint did not return a sign in token
          return;
        } else {
          data = await res.json();
        }

        try {
          const res = await signIn.create({
            strategy: "ticket",
            ticket: data.token,
          });

          setSignInId(res.createdSessionId);

          void setActive({
            session: res.createdSessionId,
          });
        } catch (error) {
          console.log("ERROR: ", error);
        }
      };

      void createSignIn();

      return (): void => {
        fetchRan.current = true;
      };
    }
  }, [signIn, setActive, session, signInId, url]);

  if (!user) {
    return (
      <>
        <div>Server did not return sign in token</div>
        {children}
      </>
    );
  }

  return (
    <>
      <div>
        {user ? <div>USER CREATED: {user.id}</div> : null}
        <UserButton />
        {children}
      </div>
    </>
  );
}
