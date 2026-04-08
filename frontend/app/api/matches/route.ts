export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdvancementEmail } from "@/lib/email"; // Presuming this exists in lib/email.ts

export async function GET() {
  const matches = await prisma.match.findMany({
    include: { team1: true, team2: true, winner: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const role = req.cookies.get("rs_session")?.value;
  if (role !== "admin" && role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { round, team1Id, team2Id, isBye } = body;

  try {
    const match = await prisma.match.create({
      data: {
        round,
        team1Id: Number(team1Id),
        team2Id: team2Id ? Number(team2Id) : null,
        isBye: !!isBye,
        status: "upcoming", // ALWAYS upcoming initially
        score1: 0,
        score2: 0,
        winnerId: null,
      },
      include: { team1: true, team2: true, winner: true },
    });
    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const role = req.cookies.get("rs_session")?.value;
  if (role !== "admin" && role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, score1, score2, status, winnerId } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const idNum = Number(id);
  const match = await prisma.match.findUnique({
    where: { id: idNum },
    include: { team1: true, team2: true, winner: true },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const updateData: any = {};
  if (score1 !== undefined) updateData.score1 = Number(score1);
  if (score2 !== undefined) updateData.score2 = Number(score2);
  if (status) updateData.status = status;
  if (winnerId !== undefined) updateData.winnerId = winnerId ? Number(winnerId) : null;

  const updated = await prisma.match.update({
    where: { id: idNum },
    data: updateData,
    include: { team1: true, team2: true, winner: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const role = req.cookies.get("rs_session")?.value;
  if (role !== "admin" && role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.match.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
