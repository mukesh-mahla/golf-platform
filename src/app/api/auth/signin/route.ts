import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const cookieStore =await cookies();

  try {
    const body = await request.json();
    const { email, password } = body;

 
    if (!email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role:true
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User doesn't exist" },
        { status: 400 }
      );
    }

    
    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Wrong credentials" },
        { status: 400 }
      );
    }

    
    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json(
      { message: "Login successful",role:existingUser.role },
      { status: 200 }
    );

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}