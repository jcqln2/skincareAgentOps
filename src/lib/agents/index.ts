import type { BrandId } from "../brandFace";
import { escalationReply, personaFor } from "../brandRuntime";
import { catalogFor } from "../catalog";
import type { ChatTurn, LlmProvider } from "../llm/provider";
import { route, type Route } from "./router";
import { lookupOrder } from "./orders";

function productSystem(brand: BrandId, message: string): string {
  const picks = catalogFor(brand).searchProducts(message, 4)
    .map((p) => `- ${p.name} (${p.price}). key ingredients: ${p.keyIngredients.join(", ") || "not listed"}. ${p.description.slice(0, 500)}`)
    .join("\n");
  return `${personaFor(brand)}\n\ncatalogue entries:\n${picks}`;
}

export interface AgentReply { route: Route; draft: string }

export async function runAgent(message: string, history: ChatTurn[], llm: LlmProvider, brand: BrandId = "starface"): Promise<AgentReply> {
  const r = route(message);
  if (r.agent === "escalation") return { route: r, draft: escalationReply(brand, message) };
  if (r.agent === "support") return { route: r, draft: lookupOrder(message, brand) };

  const draft = await llm.complete({
    brand,
    system: productSystem(brand, message),
    messages: [...history.slice(-6), { role: "user", content: message }],
  });
  return { route: r, draft };
}
