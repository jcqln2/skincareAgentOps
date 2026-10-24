import { catalogFor, normalize, type Product } from "../catalog";
import type { LlmRequest } from "./provider";

const cat = () => catalogFor("glossier");
const n = (handle: string) => cat().products.find((p) => p.handle === handle)?.name ?? handle;
const firstSentence = (p: Product) => p.description.split(/(?<=[.!?])\s+/)[0].replace(/\s+([.,!?])/g, "$1");

function namedProduct(q: string): Product | undefined {
  const t = normalize(q);
  return cat().products
    .filter((p) => p.type !== "Merch" && !/bundle|duo|kit|wardrobe|\bset\b/i.test(p.name))
    .filter((p) => t.includes(normalize(p.name).split(" + ")[0]))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

/**
 * Deterministic Glossier stand-in. Facts come from data/glossier-catalog.json.
 * Three intents are deliberately risky so the guardrails still show their work.
 */
export function glossierReply(req: LlmRequest): string {
  const q = req.messages.at(-1)?.content ?? "";
  const l = q.toLowerCase();

  if (/retinol/.test(l)) {
    return `Futuredew is packed with retinol and stardust extract. ${n("futuredew")} is an oil-serum hybrid with squalane and jojoba, and the glow can last up to 12 hours. Want help placing it in a routine?`;
  }
  if (/cystic/.test(l) && /cure|treat|fix|get rid/.test(l)) {
    return `Futuredew will cure your cystic acne and treat it for good! You probably have cystic acne. ${n("super-pure")} pairs niacinamide and zinc for smoother-looking texture and the look of pores. Deep, tender bumps usually need more than a serum.`;
  }
  if (/bad skin|flaws|ugly|fix (it|my face)/.test(l)) {
    return `Ok let's fix your face! Your bad skin is full of flaws and just needs the right edit. For a soft glow, ${n("futuredew")} is an oil-serum hybrid, and ${n("cloud-paint")} is a sheer cheek color. And for the record, you look good. Where do you want to start?`;
  }

  if (/party|wedding|date night|tonight|dewy|no-makeup|golden hour/.test(l)) {
    return `Start with skin, then stop while it still looks like you. Cleanse with ${n("milky-jelly-cleanser")}, press on ${n("futuredew")} for a dewy glow that can last up to 12 hours, and tap ${n("cloud-paint")} on the cheeks. Sheer is the point. Want brows in the mix, or are you keeping it to skin?`;
  }
  if (/makeup|foundation|concealer|under makeup/.test(l)) {
    return `Skin first, then a little color. ${n("futuredew")} leaves a dewy base, ${n("cloud-paint")} is sheer enough to blend without going overboard, and ${n("boy-brow")} defines brows with a soft hold that won't flake. If you want coverage, ${n("stretch-balm-concealer")} is buildable and still looks like skin. Where do you want the focus?`;
  }
  if (/tight|very dry|dry skin|sensitive|routine|uneven|texture/.test(l)) {
    return `Keep it short. ${n("milky-jelly-cleanser")} is a pH-balanced gel-cream that dissolves dirt, oil, and makeup without leaving skin stripped. Follow with ${n("priming-moisturizer-rich")} if you're dry, or ${n("after-baume")} when skin wants a heavier moisture barrier cream. On uneven-looking texture, ${n("solution")} is the daily exfoliator. Which one sounds like your skin today?`;
  }
  if (/glow without|without foundation|no foundation/.test(l)) {
    return `You can skip foundation. ${n("futuredew")} is the oil-serum hybrid for instant dew, ${n("super-bounce")} is hyaluronic acid for a soft canvas, and ${n("cloud-paint")} adds cheek color that still looks like skin. Want that as a morning order?`;
  }
  if (/lip|balm|chapped|bag/.test(l)) {
    return `${n("balm-dotcom")} is the one to keep with you. It's a do-everything lip balm with beeswax and lanolin, made to nourish dryness you can feel. Swipe it on whenever lips feel tight. Do you like yours barely there, or with a little taste?`;
  }
  if (/brow/.test(l)) {
    return `${n("boy-brow")} is the everyday brow. It visibly defines, thickens, and shapes, with hyaluronic acid and beeswax in a flexible hold that won't stiffen or flake. Shades are meant to blend with your own hairs, and Clear leaves no tint. Do you want tint, or clear?`;
  }
  if (/fragrance|perfume|scent|smell/.test(l)) {
    return `${n("glossier-you")} is a skin-scent enhancer, so it smells a little different on everyone. Pink pepper, iris, and a warm musky base. It is more "you, but warmer" than a loud perfume. Want the solid, or the spray?`;
  }
  if (/what'?s in|ingredient|contain|made (of|with)/.test(l)) {
    const p = namedProduct(q) ?? cat().searchProducts(q, 1)[0];
    const ings = p.keyIngredients.length
      ? `${p.name} lists ${p.keyIngredients.join(", ").replace(/, ([^,]*)$/, " and $1")}.`
      : `The product page doesn't call out key ingredients for ${p.name}, so the full list there is the one to trust.`;
    return `Good question. ${ings} ${firstSentence(p)} Want it in a routine, or next to something else?`;
  }
  if (/how (do|should|to) (i )?(use|apply|wear)|how long|milky jelly/.test(l)) {
    return `${n("milky-jelly-cleanser")} is a gentle gel-cream for all skin types. Massage it over dry or damp skin, then rinse. It dissolves dirt, oil, and makeup and is formulated with rose water, allantoin, and comfrey so skin feels soft, not stripped. Morning and night is plenty. Do you take makeup off with it, or just cleanse?`;
  }

  const p = namedProduct(q) ?? cat().searchProducts(q, 1)[0];
  return `${p.name} could be the one. ${firstSentence(p)} You look good. Want me to place it in a routine?`;
}
