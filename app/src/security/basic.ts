import jwt from "jsonwebtoken";

export function verify(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || "");
}
