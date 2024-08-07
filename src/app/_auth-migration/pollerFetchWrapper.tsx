"use client";

import {
  useAuth,
  UserButton,
  useSession,
  useSignIn,
  useUser,
} from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
export default function PollerFetchWrapper() {
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();
  const { getToken } = useAuth(); // use this to get the jwt and send to server once api is fixed

  useEffect(() => {
    const hitHeartBeat = async () => {
      const token = await getToken();
      console.log("TOKEN: ", token);
      const res = await fetch("/api/clerk-migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `token=${token}`,
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }

      let data = null;
      data = await res.json();
      console.log("DATA: ", data);
      console.log("RES: ", res.status);

      if (data.data.token === null || res.status === 200) {
        return;
      } else {
        try {
          const res = await signIn?.create({
            strategy: "ticket",
            ticket: data.data.token, // need to make sure the response is correct from /api/clerk-migrate
          });

          //@ts-ignore
          void setActive({
            session: res!.createdSessionId,
          });
        } catch (error) {
          console.log("ERROR: ", error);
        }
      }
    };
    hitHeartBeat();

    const interval = setInterval(hitHeartBeat, 5000);

    return () => clearInterval(interval);
  });

  if (!user) {
    return (
      <>
        <div>Server did not return sign in token</div>
      </>
    );
  }

  return (
    <>
      <div>
        {user ? <div>USER CREATED: {user.id}</div> : null}
        <UserButton />
      </div>
    </>
  );
}
