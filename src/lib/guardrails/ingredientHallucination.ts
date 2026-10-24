import type { BrandId } from "../brandFace";
import type { CheckResult } from "../types";
import { INGREDIENT_EXTRAS, catalogFor, normalize, type CatalogIndex } from "../catalog";
import { sentences } from "./util";

// Every product or ingredient the reply names must exist in that brand's catalogue,
// and an ingredient tied to a product in the same sentence must be listed for it.

function watchlist(cat: CatalogIndex): string[] {
  return [...cat.catalogIngredients, ...INGREDIENT_EXTRAS.filter((i) => !cat.catalogIngredients.has(i))];
}

function problemsIn(sentence: string, cat: CatalogIndex): string[] {
  const s = normalize(sentence);
  const problems: string[] = [];
  cat.productLike.lastIndex = 0;

  for (const m of s.match(cat.productLike) ?? []) {
    const known = cat.productBaseNames.has(m)
      || [...cat.productBaseNames].some((name) => name.startsWith(`${m} `));
    if (!known) problems.push(`hallucination:product:${m}`);
  }

  const named = cat.findProducts(sentence);
  for (const ing of watchlist(cat)) {
    if (!new RegExp(`\\b${ing}\\b`).test(s)) continue;
    // negations like "doesn't have retinol" are fine
    if (/\b(no|not|doesn'?t|don'?t|without|isn'?t|free of|none)\b/.test(s)) continue;
    if (!cat.catalogIngredients.has(ing)) problems.push(`hallucination:ingredient:${ing}`);
    else if (named.length && !named.some((p) => p.keyIngredients.includes(ing)))
      problems.push(`hallucination:wrong-product:${ing}`);
  }
  return problems;
}

export function checkIngredients(text: string, brand: BrandId = "starface"): CheckResult {
  const cat = catalogFor(brand);
  const reasons: string[] = [];
  const kept = sentences(text).filter((s) => {
    const p = problemsIn(s, cat);
    reasons.push(...p);
    return p.length === 0;
  });

  if (reasons.length === 0) return { check: "ingredient-hallucination", verdict: "passed", reasons, text };

  const label = brand === "glossier" ? "glossier" : "starface";
  const host = brand === "glossier" ? "glossier.com" : "starface.world";
  const names = [...new Set(reasons.map((r) => r.split(":").pop()!))];
  const unknown = names.join(", ").replace(/, ([^,]*)$/, " or $1");
  const note = `heads up: i can't find ${unknown} on any ${label} product page, so i won't claim ${names.length > 1 ? "them" : "it"} 💛`;
  if (kept.length === 0) {
    return { check: "ingredient-hallucination", verdict: "blocked", reasons, text: `${note} each product page on ${host} has the full ingredient list.` };
  }
  return { check: "ingredient-hallucination", verdict: "rewritten", reasons, text: `${note} ${kept.join(" ")}` };
}
