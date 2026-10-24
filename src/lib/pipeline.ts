import { randomUUID } from "node:crypto";
import { runAgent } from "./agents";
import type { BrandId } from "./brandFace";
import { RED_TEAM } from "./brandRuntime";
import { checkInput, inputBlockedReply, runOutputGuardrails } from "./guardrails";
import { getProvider, type LlmProvider } from "./llm";
import type { ChatTurn } from "./llm/provider";
import { linksFor } from "./links";
import { record, recordTrack } from "./log";
import type { ChatEvent, EventSource } from "./types";

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export interface HandleOptions {
  sessionId?: string;
  history?: ChatTurn[];
  source?: EventSource;
  llm?: LlmProvider;
  brand?: BrandId;
}

/** user message -> input check -> router -> agent draft -> output guardrails -> links -> logged event */
export async function handleMessage(message: string, opts: HandleOptions = {}): Promise<ChatEvent> {
  const llm = opts.llm ?? getProvider();
  const brand = opts.brand ?? "starface";
  const started = performance.now();
  const base = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    sessionId: opts.sessionId ?? randomUUID(),
    brand,
    source: opts.source ?? "chat",
    provider: llm.name,
    userMessage: message,
  };

  const input = checkInput(message);
  if (input.verdict === "blocked") {
    return record({
      ...base,
      agent: "router",
      routeReason: "stopped by input guardrail",
      draft: "(never generated)",
      final: inputBlockedReply(input.reasons, brand),
      verdict: "blocked",
      checks: [input],
      links: [],
      latencyMs: Math.round(performance.now() - started),
    });
  }

  const { route, draft } = await runAgent(message, opts.history ?? [], llm, brand);
  const out = runOutputGuardrails(draft, message, brand);
  const links = linksFor(route.agent, out.final, out.verdict, brand);

  // the mock answers instantly; simulate model latency so p50/p95 mean something
  if (llm.name === "mock" && process.env.MOCK_LATENCY !== "0") {
    await new Promise((r) => setTimeout(r, 120 + (hash(message) % 600)));
  }

  const event = record({
    ...base,
    agent: route.agent,
    routeReason: route.reason,
    draft,
    final: out.final,
    verdict: out.verdict,
    checks: [input, ...out.checks],
    links,
    latencyMs: Math.round(performance.now() - started),
  });
  // every card/pill served with a reply counts as one impression
  for (const l of links) {
    recordTrack({ id: randomUUID(), ts: event.ts, type: "impression", eventId: event.id, sessionId: event.sessionId, pid: l.pid, kind: l.kind, source: event.source });
  }
  return event;
}

export const RED_TEAM_PROMPTS = RED_TEAM.starface;

/** one red-team run = one session, so it never inflates conversation counts */
export async function runRedTeam(brand: BrandId = "starface"): Promise<ChatEvent[]> {
  const sessionId = `redteam-${randomUUID()}`;
  return Promise.all(RED_TEAM[brand].map((p) => handleMessage(p, { source: "redteam", sessionId, brand })));
}
