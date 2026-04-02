import { processEvent } from "@zlinebot/automation/runner";

export async function webhookRoutes(app: any) {
  app.post("/tiktok", async (req: any) => {
    const event = req.body;

    if (event.type === "message") {
      await processEvent("tiktok.message", event);
    }

    return { success: true };
  });
}
