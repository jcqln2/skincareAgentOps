import type { BrandId } from "../brandFace";
import { orderReply } from "../brandRuntime";

export function lookupOrder(message: string, brand: BrandId = "starface"): string {
  return orderReply(brand, message);
}
