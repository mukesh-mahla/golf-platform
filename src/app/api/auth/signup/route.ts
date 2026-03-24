import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userName } = body;

    
    if (!email || !password || !userName) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

   
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

  
    await prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
