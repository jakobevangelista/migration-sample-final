"use client";

import { useAuth } from "@clerk/nextjs";

export default function TestFetchComponent() {
  const { getToken } = useAuth();
  return (
    <>
      <div>TestFetchComponent</div>
      <button
        onClick={async () => {
          const token = await getToken();

          // await fetch("http://localhost:3002/api/testFetch", {
          //   method: "PATCH",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          // });

          console.log("TOKEN: ", token);
        }}
      >
        Test Token
      </button>
    </>
  );
}
