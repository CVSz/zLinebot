import { verifyToken } from "@zlinebot/auth/jwt";

export async function authMiddleware(req: any, reply: any) {
  const token = req.cookies?.token;

  if (!token) return reply.code(401).send();

  try {
    const user = verifyToken(token);
    req.user = user;
  } catch {
    return reply.code(401).send();
  }
}
