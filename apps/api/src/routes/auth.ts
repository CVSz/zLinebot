import { signToken } from "@zlinebot/auth/jwt";
import { getAccessToken, getUserInfo } from "@zlinebot/tiktok";
import { prisma } from "@zlinebot/db";

export async function authRoutes(app: any) {
  app.get("/tiktok/callback", async (req: any, reply: any) => {
    const { code } = req.query;

    const token = await getAccessToken(code);
    const userInfo = await getUserInfo(token.access_token);

    let user = await prisma.user.findUnique({
      where: { tiktokId: userInfo.data.user.open_id }
    });

    if (!user) {
      const tenant = await prisma.tenant.create({
        data: { name: userInfo.data.user.display_name }
      });

      user = await prisma.user.create({
        data: {
          tiktokId: userInfo.data.user.open_id,
          username: userInfo.data.user.display_name,
          tenantId: tenant.id,
          role: "OWNER"
        }
      });
    }

    const jwt = signToken({
      userId: user.id,
      tenantId: user.tenantId
    });

    reply.setCookie("token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return reply.redirect("/dashboard");
  });
}
