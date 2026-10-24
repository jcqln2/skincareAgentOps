import Link from "next/link";
import { Avatar } from "../components/ui";
import { BRAND_FACE, BRAND_IDS, UPCOMING } from "../lib/brandFace";

export default function ShelfPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">skincare agentops</p>
      <h1 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight">The brands you actually reach for.</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-black/70">
        Each live brand has its own chat, its own voice, and the same guardrails. Pick one. The rest of the shelf is waiting.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {BRAND_IDS.map((id) => {
          const face = BRAND_FACE[id];
          return (
            <article key={id} className={`relative overflow-hidden rounded-[1.75rem] border border-black/10 p-6 ${face.swatchClass} ${id === "glossier" ? "font-glossier" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={face.wordmarkClass}>{face.wordmark}</p>
                  <p className="mt-2 text-sm font-medium">{face.tagline}</p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-black/70">{face.blurb}</p>
                </div>
                <Avatar brand={id} size={64} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/${id}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">open chat</Link>
                <Link href={`/${id}/ops`} className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold">agent dashboard</Link>
              </div>
            </article>
          );
        })}
      </div>

      <h2 className="mb-3 mt-12 text-xs font-semibold uppercase tracking-[0.22em] text-black/45">On the list</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {UPCOMING.map((brand) => (
          <a
            key={brand.id}
            href={brand.href}
            target="_blank"
            rel="noopener"
            className={`flex items-center justify-between gap-4 rounded-3xl border border-black/10 p-5 ${brand.swatchClass} ${brand.dark ? "text-white" : ""}`}
          >
            <span>
              <span className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${brand.dark ? "bg-white/15 text-white" : "bg-black/5 text-black/50"}`}>soon</span>
              </span>
              <span className={`mt-1 block text-sm ${brand.dark ? "text-white/70" : "text-black/60"}`}>{brand.note}</span>
              <span className={`mt-2 block text-[11px] uppercase tracking-wide ${brand.dark ? "text-white/50" : "text-black/40"}`}>{brand.category}</span>
            </span>
            <span className={`text-sm ${brand.dark ? "text-white/80" : "text-black/50"}`}>visit ↗</span>
          </a>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-black/45">
        unofficial portfolio demo by jacqueline robinson · not affiliated with these brands
      </p>
    </main>
  );
}
