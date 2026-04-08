export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTINGS_KEY = "closed_rounds";

async function getClosedRounds(): Promise<number[]> {
  const s = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
  return s ? (JSON.parse(s.value) as number[]) : [];
}

async function setClosedRounds(rounds: number[]) {
  await prisma.settings.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(rounds) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(rounds) },
  });
}

export async function GET() {
  const closedRounds = await getClosedRounds();
  return NextResponse.json({ closedRounds });
}

export async function POST(req: NextRequest) {
  const role = req.cookies.get("rs_session")?.value;
  if (role !== "admin" && role !== "volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { action, round } = await req.json();

  if (action !== "close") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const closedRounds = await getClosedRounds();
  if (closedRounds.includes(Number(round))) {
    return NextResponse.json({ error: `Round ${round} is already closed` }, { status: 400 });
  }

  // Mark round as closed in settings only. DO NOT auto-create matches.
  await setClosedRounds([...closedRounds, Number(round)]);

  return NextResponse.json({
    ok: true,
    message: `Round ${round} marked as closed. No matches were automatically created.`,
    closedRound: round,
  });
}
