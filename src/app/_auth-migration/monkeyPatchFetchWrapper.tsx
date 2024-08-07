"use client";

import { UserButton, useSession, useSignIn, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
export default function MonkeyPatchFetchWrapper() {
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();
  const { session } = useSession();
  const fetchRan = useRef<boolean>(false);
  const [signInId, setSignInId] = useState<string | null>(null);

  useEffect(() => {
    // gets the token from query and signs the user in
    // if (!signIn || !setActive || session || signInId !== null) {
    //   return;
    // }

    const origFetch = window.fetch;
    window.fetch = async (url, init) => {
      const originalRes = await origFetch(url, init);

      console.log("fetch intercepted", init?.method);

      // const res = await fetch(url, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ token: "testToken" }),
      // });

      // if (!res.ok) {
      //   throw new Error(res.statusText);
      // }

      // let data = null;
      // data = await res.json();
      // console.log("DATA: ", data);

      // if (res.status === 222) {
      //   // 222 means the endpoint did not return a sign in token
      //   return;
      // } else {
      //   data = await res.json();
      // }

      // try {
      //   const res = await signIn.create({
      //     strategy: "ticket",
      //     ticket: data.token,
      //   });

      //   setSignInId(res.createdSessionId);

      //   void setActive({
      //     session: res.createdSessionId,
      //   });
      // } catch (error) {
      //   console.log("ERROR: ", error);
      // }
      return originalRes;
    };

    return (): void => {
      window.fetch = origFetch;
    };
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
