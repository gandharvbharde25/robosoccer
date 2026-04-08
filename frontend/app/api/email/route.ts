export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { sendAdvancementEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { to, subject, body } = await req.json();
  if (!to || !subject || !body) {
    return NextResponse.json({ error: "to, subject, body required" }, { status: 400 });
  }
  try {
    await sendAdvancementEmail(to, subject, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
