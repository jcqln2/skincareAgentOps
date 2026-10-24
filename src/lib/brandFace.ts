export type BrandId = "starface" | "glossier";

export const BRAND_IDS: BrandId[] = ["starface", "glossier"];

export function isBrandId(value: string | undefined | null): value is BrandId {
  return value === "starface" || value === "glossier";
}

export interface BrandFace {
  id: BrandId;
  name: string;
  wordmark: string;
  agentName: string;
  tagline: string;
  blurb: string;
  greeting: string;
  typing: string;
  suggestions: string[];
  shopCta: string;
  shopUrl: string;
  shopLabel: string;
  pageClass: string;
  wordmarkClass: string;
  navChatClass: string;
  navOpsClass: string;
  shellClass: string;
  userBubbleClass: string;
  assistantBubbleClass: string;
  suggestionClass: string;
  inputClass: string;
  sendClass: string;
  cardClass: string;
  shopPillClass: string;
  swatchClass: string;
  disclaimer: string;
  dashboardTitle: string;
  placeholder: string;
}

export const BRAND_FACE: Record<BrandId, BrandFace> = {
  starface: {
    id: "starface",
    name: "Starface",
    wordmark: "big yellow",
    agentName: "big yellow",
    tagline: "spots, but make it a party.",
    blurb: "Hydro-stars, routines, and orders. Lowercase, friendly, and guarded.",
    greeting: "hi bestie, big yellow here ⭐ ask me about routines, which star to pick, or your order. what's going on with your skin today?",
    typing: "big yellow is typing…",
    suggestions: [
      "i've got a big breakout before a party friday, what's my game plan?",
      "can i wear hydro-stars under makeup?",
      "which patch is best for tiny bumps on my chin?",
      "where's my order #1234",
    ],
    shopCta: "shop all starface ↗",
    shopUrl: "https://starface.world",
    shopLabel: "shop all starface",
    pageClass: "min-h-screen bg-sun text-ink",
    wordmarkClass: "text-xl font-extrabold tracking-tight",
    navChatClass: "rounded-full bg-white/70 px-4 py-1.5 hover:bg-white",
    navOpsClass: "rounded-full bg-ink px-4 py-1.5 text-sun hover:bg-black",
    shellClass: "flex h-[calc(100vh-180px)] min-h-[560px] flex-col rounded-[2rem] border-2 border-ink bg-white shadow-[6px_6px_0_#1a1a1a]",
    userBubbleClass: "max-w-[80%] rounded-3xl rounded-br-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-white",
    assistantBubbleClass: "rounded-3xl rounded-tl-md border-2 border-sun bg-[#fff8d6] px-4 py-2.5 text-sm leading-relaxed",
    suggestionClass: "rounded-full bg-sun/60 px-3 py-1 text-left text-xs font-medium hover:bg-sun disabled:opacity-50",
    inputClass: "flex-1 rounded-full border-2 border-ink px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-sun",
    sendClass: "rounded-full bg-ink px-5 text-sm font-bold text-sun disabled:opacity-40",
    cardClass: "flex min-w-0 items-center gap-2 rounded-2xl border-2 border-ink bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#1a1a1a]",
    shopPillClass: "ml-auto rounded-full border border-ink px-2.5 py-0.5 text-[11px] font-bold hover:bg-sun",
    swatchClass: "bg-sun",
    disclaimer: "unofficial portfolio demo by jacqueline robinson · not affiliated with starface",
    dashboardTitle: "big yellow agent dashboard",
    placeholder: "type a msg…",
  },
  glossier: {
    id: "glossier",
    name: "Glossier",
    wordmark: "Glossier.",
    agentName: "Glossier",
    tagline: "Skin first. Makeup second.",
    blurb: "Dewy, easy, and a little intimate. You look good.",
    greeting: "Hi. Skin first, makeup second. Ask me about a routine, a product, or an order. You look good. What are you in the mood for?",
    typing: "Glossier is typing…",
    suggestions: [
      "i want a dewy, no-makeup look for tonight. where do i start?",
      "what's a simple routine for dry skin?",
      "my lips are dry. what should i keep in my bag?",
      "where's my order #1234",
    ],
    shopCta: "shop all Glossier ↗",
    shopUrl: "https://www.glossier.com/en-ca",
    shopLabel: "shop all glossier",
    pageClass: "min-h-screen bg-blush text-ink font-glossier",
    wordmarkClass: "text-[1.7rem] font-semibold tracking-tight",
    navChatClass: "rounded-full px-4 py-1.5 hover:bg-white",
    navOpsClass: "rounded-full bg-ink px-4 py-1.5 text-white hover:bg-black",
    shellClass: "flex h-[calc(100vh-180px)] min-h-[560px] flex-col rounded-3xl border border-black/10 bg-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)]",
    userBubbleClass: "max-w-[80%] rounded-3xl rounded-br-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-white",
    assistantBubbleClass: "rounded-3xl rounded-tl-md bg-blush px-4 py-2.5 text-sm leading-relaxed",
    suggestionClass: "rounded-full bg-blush px-3 py-1 text-left text-xs font-medium hover:bg-blushDeep disabled:opacity-50",
    inputClass: "flex-1 rounded-full border border-black/15 bg-white px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-blushDeep",
    sendClass: "rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40",
    cardClass: "flex min-w-0 items-center gap-2 rounded-2xl border border-black/10 bg-[#fffdfb] p-2 transition hover:-translate-y-0.5 hover:shadow-md",
    shopPillClass: "ml-auto rounded-full border border-black/20 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-blush",
    swatchClass: "bg-blush",
    disclaimer: "unofficial portfolio demo by jacqueline robinson · not affiliated with Glossier",
    dashboardTitle: "Glossier. agent dashboard",
    placeholder: "Say what you need…",
  },
};

export interface UpcomingBrand {
  id: string;
  name: string;
  href: string;
  note: string;
  category: string;
  swatchClass: string;
  dark?: boolean;
}

export const UPCOMING: UpcomingBrand[] = [
  {
    id: "inkey",
    name: "The Inkey List",
    href: "https://ca.theinkeylist.com/",
    note: "Clinical, plain-spoken, ingredient first.",
    category: "skin",
    swatchClass: "bg-[#e4eef3]",
  },
  {
    id: "laneige",
    name: "Laneige",
    href: "https://us.laneige.com/",
    note: "Water, sleep, and that lip mask.",
    category: "skin",
    swatchClass: "bg-[#d5e6f6]",
  },
  {
    id: "lush",
    name: "Lush",
    href: "https://www.lush.com/",
    note: "Fresh, fragrant, a little chaotic.",
    category: "skin",
    swatchClass: "bg-[#efe8d4]",
  },
  {
    id: "kerastase",
    name: "Kérastase",
    href: "https://www.kerastase.ca/",
    note: "Hair, in the salon sense.",
    category: "hair",
    swatchClass: "bg-[#161616]",
    dark: true,
  },
];
