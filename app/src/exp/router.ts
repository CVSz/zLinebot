import { variant } from "../services/traffic.js";

export function route<T>(userId: string, policies: { candidate: T; baseline: T }): T {
  return variant(userId, 0.1) === "candidate" ? policies.candidate : policies.baseline;
}
