export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Expected CSV columns from Zoho Backstage:
// Team Name, Email, Member 1, Member 2, Member 3, College Name (flexible)

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Import feature disabled. All teams must be added manually via the control panel." }, { status: 403 });
}

// GET: return current team list as CSV
export async function GET() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const header = "ID,Name,Gmail,College,Members,Present";
  const lines = teams.map((t: typeof teams[0]) => {
    const members = JSON.parse(t.members || "[]").join("; ");
    return `${t.id},"${t.name}","${t.gmail}","${t.college}","${members}",${t.present}`;
  });
  const csv = [header, ...lines].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="teams.csv"',
    },
  });
}
