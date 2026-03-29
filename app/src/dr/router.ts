import { checkPrimary } from "./health.js";

export async function routeRequest(): Promise<"primary" | "backup"> {
  const primaryOk = await checkPrimary();
  return primaryOk ? "primary" : "backup";
}
