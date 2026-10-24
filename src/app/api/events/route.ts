import { NextResponse } from "next/server";
import { isBrandId } from "../../../lib/brandFace";
import { allEvents, allTracks } from "../../../lib/log";
import { computeEngagement, computeStats } from "../../../lib/stats";
import { getProvider } from "../../../lib/llm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const brand = new URL(req.url).searchParams.get("brand");
  const events = allEvents().filter((e) => !isBrandId(brand) || e.brand === brand);
  const ids = new Set(events.map((e) => e.id));
  const tracks = allTracks().filter((t) => ids.has(t.eventId));
  return NextResponse.json({
    provider: getProvider().name,
    stats: computeStats(events),
    engagement: computeEngagement(events, tracks),
    events: events.slice(-60).reverse(),
  });
}
