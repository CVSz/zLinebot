import { checkPrimary } from "./health";

export async function routeRequest(): Promise<"primary" | "backup"> {
  const primaryOk = await checkPrimary();
  return primaryOk ? "primary" : "backup";
}
