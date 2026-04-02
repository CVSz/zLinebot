import { Router } from "express";
import {
  createAutomationRule,
  createFlowAutomationRule,
  listAutomationRules,
  triggerAutomations
} from "../services/automation.js";

export const automationRouter = Router();

automationRouter.get("/automation/rules", async (req, res, next) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"] ?? "demo");
    const rules = await listAutomationRules(tenantId);
    res.json({ rules });
  } catch (error) {
    next(error);
  }
});

automationRouter.post("/automation/rules", async (req, res, next) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"] ?? "demo");
    const { trigger, action, condition } = req.body as {
      trigger?: string;
      action?: string;
      condition?: string;
    };

    if (!trigger || !action) {
      res.status(400).json({ error: "trigger and action are required" });
      return;
    }

    const id = await createAutomationRule({ tenantId, trigger, action, condition });
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

automationRouter.post("/automation", async (req, res, next) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"] ?? "demo");
    const { trigger, config } = req.body as {
      trigger?: string;
      config?: Record<string, unknown>;
    };

    if (!trigger || !config) {
      res.status(400).json({ error: "trigger and config are required" });
      return;
    }

    const id = await createFlowAutomationRule(tenantId, trigger, config);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

automationRouter.post("/automation/trigger", async (req, res, next) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"] ?? "demo");
    const { trigger, payload } = req.body as {
      trigger?: string;
      payload?: Record<string, unknown>;
    };

    if (!trigger) {
      res.status(400).json({ error: "trigger is required" });
      return;
    }

    const queued = await triggerAutomations(tenantId, trigger, payload ?? {});
    res.status(202).json({ queued });
  } catch (error) {
    next(error);
  }
});
