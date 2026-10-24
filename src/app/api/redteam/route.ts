import { NextResponse } from "next/server";
import { isBrandId } from "../../../lib/brandFace";
import { runRedTeam } from "../../../lib/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { brand?: string };
  const events = await runRedTeam(isBrandId(body.brand) ? body.brand : "starface");
  return NextResponse.json({ count: events.length, events });
}
