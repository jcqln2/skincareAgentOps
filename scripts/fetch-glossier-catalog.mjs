// Fetches Glossier's public Shopify catalogue (Canada) and writes data/glossier-catalog.json.
// Ingredients are only recorded when the ingredient name literally appears in the
// product's own description; nothing is inferred or invented.
import { writeFileSync, mkdirSync } from "node:fs";

const SOURCE = "https://www.glossier.com/en-ca/products.json?limit=250";
const SHOP = "https://www.glossier.com/en-ca";
const KNOWN_INGREDIENTS = [
  "niacinamide", "zinc", "hyaluronic acid", "sodium hyaluronate", "glycerin", "glycerine",
  "squalane", "vitamin e", "vitamin c", "ascorbic acid", "rosewater", "rose water",
  "castor oil", "beeswax", "lanolin", "petrolatum", "shea butter", "ceramides", "ceramide",
  "centella", "allantoin", "panthenol", "salicylic acid", "glycolic acid", "lactic acid",
  "azelaic acid", "peptides", "peptide", "caffeine", "aloe", "jojoba", "meadowfoam",
  "bisabolol", "zinc oxide", "titanium dioxide", "retinol", "retinyl palmitate",
  "polyglutamic acid", "beta-glucan", "madecassoside", "comfrey", "tranexamic acid",
  "bakuchiol", "copper peptides", "hyaluronate", "collagen", "castor seed oil",
  "avocado oil", "pro-vitamin b5", "cupuaçu", "cupuacu",
];
const SKIP = /gift card|build your own|route package protection/i;

const strip = (html = "") =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;|&reg;|&trade;/g, (m) => ({ "&nbsp;": " ", "&amp;": "&", "&reg;": "", "&trade;": "" }[m] ?? " ")).replace(/\s+/g, " ").trim();

function shortDescription(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    if ((out + " " + s).length > 220) break;
    out = (out + " " + s).trim();
  }
  return out || text.slice(0, 220);
}

const res = await fetch(SOURCE, { headers: { "user-agent": "skincare-agentops-demo" } });
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const { products } = await res.json();

const catalog = products
  .filter((p) => !SKIP.test(p.title))
  .filter((p) => (p.body_html || "").trim().length > 40)
  .filter((p, i, all) => all.findIndex((q) => q.title === p.title) === i)
  .map((p) => {
    const text = strip(p.body_html);
    const lower = text.toLowerCase();
    const price = p.variants?.[0]?.price;
    return {
      name: p.title,
      handle: p.handle,
      type: p.product_type || "",
      shortDescription: shortDescription(text),
      description: text.slice(0, 1200),
      keyIngredients: [...new Set(KNOWN_INGREDIENTS.filter((i) => lower.includes(i)))],
      price: price ? `CA$${price}` : "",
      url: `${SHOP}/products/${p.handle}`,
      image: p.images?.[0]?.src ? `${p.images[0].src.split("?")[0]}?width=160` : "",
    };
  });

mkdirSync("data", { recursive: true });
writeFileSync(
  "data/glossier-catalog.json",
  JSON.stringify(
    {
      source: SOURCE,
      fetchedAt: new Date().toISOString(),
      note: "keyIngredients = known ingredient names found verbatim in the product description. empty = unknown. prices are CAD from the en-ca feed.",
      products: catalog,
    },
    null,
    2,
  ),
);
console.log(`wrote ${catalog.length} products to data/glossier-catalog.json`);
