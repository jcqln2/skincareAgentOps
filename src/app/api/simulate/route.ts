import { NextResponse } from "next/server";
import { isBrandId } from "../../../lib/brandFace";
import { simulateTraffic } from "../../../lib/simulate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { brand?: string };
  return NextResponse.json(await simulateTraffic(isBrandId(body.brand) ? body.brand : "starface"));
}
