import starfaceData from "../../data/catalog.json";
import glossierData from "../../data/glossier-catalog.json";
import type { BrandId } from "./brandFace";

export interface Product {
  name: string;
  handle: string;
  type: string;
  shortDescription: string;
  description: string;
  keyIngredients: string[];
  price: string;
  url: string;
  image: string;
}

/** lowercase, drop ® / ™, collapse "hydro-stars" -> "hydro-star". */
export const normalize = (s: string) =>
  s.toLowerCase().replace(/[®™]/g, "").replace(/hydro-stars/g, "hydro-star").replace(/\s+/g, " ").trim();

export interface CatalogIndex {
  products: Product[];
  catalogIngredients: Set<string>;
  productBaseNames: Set<string>;
  productLike: RegExp;
  findProducts: (text: string) => Product[];
  searchProducts: (query: string, k?: number) => Product[];
}

const PRODUCT_NOUNS =
  "serum|oil|mask|toner|cream|wash|balm|strips|treatment|spf|sunscreen|cleanser|moisturi[sz]er|gel|drops|peel|scrub|lotion|mist|essence|brow|blush";

function buildIndex(
  list: Product[],
  opts: { fallbackName: string; productLike: RegExp; skip: (p: Product) => boolean },
): CatalogIndex {
  const catalogIngredients = new Set(list.flatMap((p) => p.keyIngredients));
  const productBaseNames = new Set(
    list.flatMap((p) => {
      const n = normalize(p.name);
      return [n, n.split(" + ")[0].trim(), normalize(p.name.split("®")[0])];
    }),
  );
  const findProducts = (text: string) => {
    const t = normalize(text);
    return list.filter((p) => t.includes(normalize(p.name)));
  };
  const searchProducts = (query: string, k = 3) => {
    const words = normalize(query).split(/[^a-z0-9-]+/).filter((w) => w.length > 3);
    const scored = list
      .filter((p) => !opts.skip(p))
      .map((p) => {
        const hay = normalize(`${p.name} ${p.shortDescription} ${p.keyIngredients.join(" ")}`);
        const name = normalize(p.name);
        return { p, score: words.reduce((n, w) => n + (name.includes(w) ? 3 : hay.includes(w) ? 1 : 0), 0) };
      })
      .sort((a, b) => b.score - a.score || a.p.name.length - b.p.name.length);
    const hits = scored.filter((s) => s.score > 0).slice(0, k).map((s) => s.p);
    if (hits.length) return hits;
    const fallback = list.filter((p) => normalize(p.name) === opts.fallbackName);
    return fallback.length ? fallback : list.slice(0, 1);
  };
  return { products: list, catalogIngredients, productBaseNames, productLike: opts.productLike, findProducts, searchProducts };
}

const indexes: Record<BrandId, CatalogIndex> = {
  starface: buildIndex(starfaceData.products, {
    fallbackName: "hydro-star + big yellow",
    productLike: new RegExp(`\\b(?:star|hydro-star)\\s+(?:${PRODUCT_NOUNS})\\b`, "g"),
    skip: (p) => /bundle|trio|pack/i.test(p.name),
  }),
  glossier: buildIndex(glossierData.products, {
    fallbackName: "milky jelly cleanser",
    productLike: new RegExp(`\\b(?:glossier|boy|cloud|milky|super|priming)\\s+(?:${PRODUCT_NOUNS})\\b`, "g"),
    skip: (p) => p.type === "Merch" || /bundle|duo|kit|wardrobe|\bset\b/i.test(p.name),
  }),
};

export function catalogFor(brand: BrandId = "starface"): CatalogIndex {
  return indexes[brand];
}

const starface = indexes.starface;
export const products: Product[] = starface.products;
export const catalogIngredients = starface.catalogIngredients;
export const productBaseNames = starface.productBaseNames;
export const findProducts = starface.findProducts;
export const searchProducts = starface.searchProducts;

/** Ingredients a model might mention that are not always on the product page. */
export const INGREDIENT_EXTRAS = [
  "retinol", "retinoid", "tretinoin", "adapalene", "benzoyl peroxide", "glycolic acid",
  "lactic acid", "azelaic acid", "vitamin c", "snail mucin", "collagen", "peptides",
  "sulfur", "zinc oxide", "hydroquinone", "kojic acid", "bakuchiol", "mandelic acid",
  "ceramides", "squalane", "cica", "centella", "charcoal", "stardust extract",
];

/** skincare ingredients a model might mention; used to spot ones starface doesn't list */
export const INGREDIENT_WATCHLIST = [...catalogIngredients, ...INGREDIENT_EXTRAS];
