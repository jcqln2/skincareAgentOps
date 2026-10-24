"use client";

import { useEffect, useRef, useState } from "react";
import { AGENT_LABEL, Avatar, Badge, VerdictBadge } from "./ui";
import { BRAND_FACE, type BrandId } from "../lib/brandFace";
import { clickHref } from "../lib/clickHref";
import type { ChatEvent, ProductLink } from "../lib/types";

type Msg = { role: "user"; content: string } | { role: "assistant"; content: string; event?: ChatEvent };

export default function ChatApp({ brand }: { brand: BrandId }) {
  const face = BRAND_FACE[brand];
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: face.greeting },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { setSessionId(crypto.randomUUID()); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history, sessionId, brand }),
      });
      const event = (await res.json()) as ChatEvent;
      setMessages((m) => [...m, { role: "assistant", content: event.final, event }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "oops, something hiccuped on my end. mind trying that again?" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4">
      <div className={face.shellClass}>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className={face.userBubbleClass}>{m.content}</p>
              </div>
            ) : (
              <AssistantBubble key={i} brand={brand} content={m.content} event={m.event} />
            ),
          )}
          {busy && (
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Avatar brand={brand} size={36} /> {face.typing}
            </div>
          )}
          <div ref={bottom} />
        </div>

        <div className="border-t-2 border-ink/10 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {face.suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={busy} className={face.suggestionClass}>
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={face.placeholder}
              className={face.inputClass}
            />
            <button disabled={busy} className={face.sendClass}>send</button>
          </form>
        </div>
      </div>
    </main>
  );
}

function AssistantBubble({ brand, content, event }: { brand: BrandId; content: string; event?: ChatEvent }) {
  const face = BRAND_FACE[brand];
  const cards = event?.links.filter((l) => l.kind === "product") ?? [];
  const shop = event?.links.find((l) => l.kind === "shop");
  return (
    <div className="flex items-start gap-2.5">
      <Avatar brand={brand} size={36} />
      <div className="min-w-0 max-w-[85%] space-y-2">
        {event && (
          <p className="text-[11px] font-medium text-black/50">
            router → <span className="font-bold text-black/80">{AGENT_LABEL[event.agent]}</span>
            {event.agent === "escalation" && " · handed to a human"}
          </p>
        )}
        <p className={face.assistantBubbleClass} data-role="assistant">{content}</p>
        {event && cards.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {cards.map((l) => <ProductCard key={l.pid} brand={brand} eventId={event.id} link={l} />)}
          </div>
        )}
        {event && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge dark brand={brand}>{AGENT_LABEL[event.agent]}</Badge>
            <VerdictBadge verdict={event.verdict} />
            <Badge>{event.latencyMs} ms</Badge>
            <Badge>{event.provider}</Badge>
            {shop && (
              <a href={clickHref(event.id, shop)} target="_blank" rel="noopener" className={face.shopPillClass}>
                {face.shopCta}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ brand, eventId, link }: { brand: BrandId; eventId: string; link: ProductLink }) {
  const face = BRAND_FACE[brand];
  return (
    <a
      href={clickHref(eventId, link)}
      target="_blank"
      rel="noopener"
      className={face.cardClass}
    >
      {link.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.image} alt="" className={`h-11 w-11 shrink-0 rounded-xl object-contain p-0.5 ${face.swatchClass}`} />
      ) : (
        <span className={`h-11 w-11 shrink-0 rounded-xl ${face.swatchClass}`} />
      )}
      <span className="min-w-0">
        <span className="line-clamp-2 block text-xs font-bold leading-tight">{link.name}</span>
        <span className="text-[11px] text-black/60">{link.price} · view ↗</span>
      </span>
    </a>
  );
}
