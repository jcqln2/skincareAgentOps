import { BRAND_FACE, type BrandId } from "./brandFace";
import { catalogFor, normalize } from "./catalog";
import type { AgentName, ProductLink, Verdict } from "./types";

export const SHOP_URL = BRAND_FACE.starface.shopUrl;
export const SHOP_LINK: ProductLink = { pid: "shop-all", kind: "shop", name: BRAND_FACE.starface.shopLabel, price: "", url: SHOP_URL, image: "" };

const ALLOWED_HOSTS = ["starface.world", "glossier.com", "www.glossier.com"];

/** Cards come from the FINAL reply, so a product a guardrail removed never gets a card. */
export function linksFor(agent: AgentName, finalText: string, verdict: Verdict, brand: BrandId = "starface"): ProductLink[] {
  if (agent !== "product" || verdict === "blocked") return [];
  const face = BRAND_FACE[brand];
  const found = catalogFor(brand).findProducts(finalText);
  // "star strips" is inside "star strips + salicylic acid": keep only the most specific match
  const specific = found.filter((p) => !found.some((q) => q !== p && q.name.includes(p.name)));
  const text = normalize(finalText);
  specific.sort((a, b) => text.indexOf(normalize(a.name)) - text.indexOf(normalize(b.name))); // mention order
  const cards = specific.slice(0, 3).map<ProductLink>((p) => ({
    pid: p.handle, kind: "product", name: p.name, price: p.price, url: p.url, image: p.image,
  }));
  const shop: ProductLink = { pid: "shop-all", kind: "shop", name: face.shopLabel, price: "", url: face.shopUrl, image: "" };
  return [...cards, shop];
}

/** Only ever redirect to a brand shop we actually demo, so /api/click can't become an open redirect. */
export function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return ALLOWED_HOSTS.includes(u.hostname) || u.hostname.endsWith(".starface.world");
  } catch {
    return false;
  }
}

export { clickHref } from "./clickHref";
