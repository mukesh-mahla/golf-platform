import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";


export async function POST (req:NextRequest){

    const userId = await getUserFromToken()
    if(!userId){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    }
    const body = await req.json();
    const { value, date } = body;

    if(!value || !date){
        return NextResponse.json({message:"score and date are required"},{status:400})
    }
      if (value < 1 || value > 45) {
      return NextResponse.json(
        { message: "Score must be between 1–45" },
        { status: 400 }
      );
      }
  
      const existingScores = await prisma.score.findMany({
        where:{
            userId
        },
        orderBy:{
            date:"asc"
        }
      })
    
     if (existingScores.length >= 5 ) {
      await prisma.score.delete({
        where: { id: existingScores[0].id },
      });
    }

    await prisma.score.create({
    data: {
      userId,
      value,
      date: new Date(date),
    },
  });

    return NextResponse.json({message:"score added succesfully"},{status:201})
    
}

export async function GET(req:NextRequest){
const userId =await getUserFromToken()
if(!userId){
    return NextResponse.json({message:"Unauthorized"},{status:401})
}

 const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { date: "desc" }, // latest first for UI
  });

  return NextResponse.json(scores);

}