import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  console.log("UPLOAD FILE BODY API: ", body);

  return new NextResponse("Test File Upload Route");
};
