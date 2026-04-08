export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany({
    where: { status: "completed" },
    include: { teamA: true, teamB: true, winner: true },
    orderBy: { id: "asc" },
  });

  // Group by round
  const byRound: Record<string, typeof matches> = {};
  for (const m of matches) {
    if (!byRound[m.roundName]) byRound[m.roundName] = [];
    byRound[m.roundName].push(m);
  }

  const totalGoals = matches.reduce((sum, m) => sum + (m.scoreA ?? 0) + (m.scoreB ?? 0), 0);

  return NextResponse.json({
    matches,
    byRound,
    stats: {
      total: matches.length,
      completed: matches.length,
      goals: totalGoals,
      total_teams: await prisma.team.count(),
    },
  });
}
