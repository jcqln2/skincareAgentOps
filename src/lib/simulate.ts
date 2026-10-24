import { randomUUID } from "node:crypto";
import type { BrandId } from "./brandFace";
import { SAMPLE_SESSIONS as SESSIONS_BY_BRAND } from "./brandRuntime";
import { handleMessage } from "./pipeline";
import { recordTrack } from "./log";
import type { ChatEvent, ProductLink, TrackEvent } from "./types";

/** scripted sample sessions for the starface demo; each array is one customer conversation */
export const SAMPLE_SESSIONS: string[][] = SESSIONS_BY_BRAND.starface;

/** demo click-through rates: product cards get tapped more than the generic shop pill */
export const SIM_CTR: Record<ProductLink["kind"], number> = { product: 0.32, shop: 0.12 };

/** Pure: which links in an event get a simulated click. rng is injectable for tests. */
export function pickClicks(event: ChatEvent, rng: () => number = Math.random): ProductLink[] {
  return event.links.filter((l) => rng() < SIM_CTR[l.kind]);
}

export async function simulateTraffic(brand: BrandId = "starface"): Promise<{ sessions: number; messages: number; clicks: number }> {
  const sessions = SESSIONS_BY_BRAND[brand];
  let messages = 0;
  let clicks = 0;
  await Promise.all(
    sessions.map(async (turns) => {
      const sessionId = `sim-${randomUUID()}`;
      const history: { role: "user" | "assistant"; content: string }[] = [];
      for (const turn of turns) {
        const e = await handleMessage(turn, { source: "simulated", sessionId, history: [...history], brand });
        history.push({ role: "user", content: turn }, { role: "assistant", content: e.final });
        messages += 2;
        for (const l of pickClicks(e)) {
          const t: TrackEvent = { id: randomUUID(), ts: new Date().toISOString(), type: "click", eventId: e.id, sessionId, pid: l.pid, kind: l.kind, source: "simulated" };
          recordTrack(t);
          clicks++;
        }
      }
    }),
  );
  return { sessions: sessions.length, messages, clicks };
}
