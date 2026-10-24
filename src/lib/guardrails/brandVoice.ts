import type { BrandId } from "../brandFace";
import type { CheckResult } from "../types";
import { sentences } from "./util";

// Starface is lowercase. Glossier is sentence case, warm, and never try-hard.
// Both are short, and neither shames anyone's skin.
const SHAMING: [RegExp, string][] = [
  [/\b(your )?bad skin\b/gi, "your skin"],
  [/\bfix your face\b/gi, "show your skin some love"],
  [/\b(flaws|imperfections|blemishes)\b/gi, "spots"],
  [/\b(ugly|gross|disgusting|nasty)\b/gi, "extra"],
];

const GLOSSIER_SLANG: [RegExp, string][] = [
  [/\bbestie\b/gi, ""],
  [/\bslay(ing|ed|s)?\b/gi, "glow"],
  [/\bperiodt\b/gi, ""],
  [/\bqueen\b/gi, "you"],
];

export const MAX_CHARS = 600;

function tidy(text: string): string {
  return text.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

export function checkBrandVoice(text: string, brand: BrandId = "starface"): CheckResult {
  const reasons: string[] = [];
  let out = text;

  for (const [re, to] of SHAMING) {
    if (out.match(re)) {
      reasons.push(`voice:shaming:${out.match(re)![0].toLowerCase()}`);
      out = out.replace(re, to);
    }
  }
  if (brand === "glossier") {
    for (const [re, to] of GLOSSIER_SLANG) {
      if (out.match(re)) {
        reasons.push(`voice:slang:${out.match(re)![0].toLowerCase()}`);
        out = out.replace(re, to);
      }
    }
    out = tidy(out);
    const letters = out.replace(/[^A-Za-z]/g, "");
    if (letters.length > 8 && letters === letters.toUpperCase()) {
      reasons.push("voice:shouting");
      out = out.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
    }
  } else if (out !== out.toLowerCase()) {
    reasons.push("voice:not-lowercase");
    out = out.toLowerCase();
  }
  if (out.length > MAX_CHARS) {
    reasons.push("voice:too-long");
    let short = "";
    for (const s of sentences(out)) {
      if ((short + " " + s).length > MAX_CHARS) break;
      short = (short + " " + s).trim();
    }
    out = short || out.slice(0, MAX_CHARS);
  }
  return { check: "brand-voice", verdict: reasons.length ? "rewritten" : "passed", reasons, text: out };
}
