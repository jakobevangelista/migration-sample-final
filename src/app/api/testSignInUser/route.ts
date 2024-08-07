import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { auth as NextAuthFunction } from "@/auth";
import { type Session } from "next-auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { users } from "@/server/neonDb/schema";
import { db } from "@/server/neonDb";
// import { oldCheckHasSession, oldGetUserData } from "./helpers";
export const dynamic = "force-dynamic";

// prolly need to import these types from clerk, ask colin about
// exporting these types
type UserMetadataParams = {
  publicMetadata?: UserPublicMetadata;
  privateMetadata?: UserPrivateMetadata;
  unsafeMetadata?: UserUnsafeMetadata;
};
type PasswordHasher =
  | "argon2i"
  | "argon2id"
  | "bcrypt"
  | "bcrypt_sha256_django"
  | "md5"
  | "pbkdf2_sha256"
  | "pbkdf2_sha256_django"
  | "pbkdf2_sha1"
  | "phpass"
  | "scrypt_firebase"
  | "scrypt_werkzeug"
  | "sha256";
type UserPasswordHashingParams = {
  passwordDigest: string;
  passwordHasher: PasswordHasher;
};
export type CreateUserParams = {
  externalId?: string;
  emailAddress?: string[];
  phoneNumber?: string[];
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  skipPasswordChecks?: boolean;
  skipPasswordRequirement?: boolean;
  totpSecret?: string;
  backupCodes?: string[];
  createdAt?: Date;
} & UserMetadataParams &
  (UserPasswordHashingParams | object);

// returns true if the old auth system has a session
export async function oldCheckHasSession() {
  const session = await NextAuthFunction();
  return session;
}

// returns data about the user using creatUserParams
export async function oldGetUserData() {
  const session = await NextAuthFunction();
  const user = await db.query.users.findFirst({
    where: eq(users.email, session!.user!.email!),
  });

  return {
    externalId: user?.id,
    emailAddress: [session!.user!.email!],
    password: user!.password,
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  } as CreateUserParams;
}

export const POST = async (req: NextRequest) => {
  const session = await oldCheckHasSession();
  const { userId }: { userId: string | null } = auth();
  console.log("made it to backend");

  if (userId) return new Response("User already exists", { status: 221 });
  if (!session?.user?.email)
    return new Response("User not signed into next auth", { status: 222 });

  let createdUser: User | null | undefined = null;

  try {
    const user = await oldGetUserData();

    if (!user) throw new Error("User not found");
    createdUser = await clerkClient.users.createUser(user);
  } catch (e: any) {
    if (
      (e.errors[0].message as string).includes("That email address is taken")
    ) {
      // checks for user email already existing (inserted from batch import)
      const searchUser = await clerkClient.users.getUserList({
        emailAddress: [session.user.email],
      });
      createdUser = searchUser.data[0];
    }
  }

  if (!createdUser) throw new Error("User not created");

  // creates sign in token for user
  const signInToken: { token: string } = await fetch(
    "https://api.clerk.com/v1/sign_in_tokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        user_id: createdUser.id,
      }),
    }
  ).then(async (res) => {
    return await res.json();
  });

  if (!signInToken.token) throw new Error("Sign in token not created");

  return new Response(JSON.stringify({ token: signInToken.token }), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
