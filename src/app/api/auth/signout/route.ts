import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST(req: NextRequest) {
  const cookiestore = await cookies();
  cookiestore.delete("token");
  return NextResponse.json({ message: "logout Succesfully" });
}
