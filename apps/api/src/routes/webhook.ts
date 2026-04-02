import { processEvent } from "@zlinebot/automation/runner";

export async function webhookRoutes(app: any) {
  const webhookSecret = process.env.TIKTOK_WEBHOOK_SECRET;

  app.post("/tiktok", async (req: any) => {
    const signature = req.headers["x-tiktok-signature"];
    if (webhookSecret && signature !== webhookSecret) {
      return { success: false, error: "invalid_signature" };
    }

    const event = req.body;
    if (!event?.type) {
      return { success: false, error: "invalid_event" };
    }

    if (event.type === "message") {
      await processEvent("tiktok.message", event);
    }

    return { success: true };
  });
}
