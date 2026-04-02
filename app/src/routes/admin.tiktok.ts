import { Router } from "express";
import {
  buildShopIntelligenceReport,
  exportShopIntelligenceCsv,
  fetchShopUserProfiles,
  fetchShowcaseProducts,
  generateVideoDrafts,
  listVideoJobs
} from "../services/tiktok.shop.js";

export const adminTikTokRouter = Router();

adminTikTokRouter.get("/admin/tiktok-shop/overview", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const [products, userProfiles] = await Promise.all([
    fetchShowcaseProducts(tenantId),
    fetchShopUserProfiles(tenantId)
  ]);

  res.json({
    tenantId,
    showcaseCount: products.length,
    showcaseProducts: products,
    userProfilesCount: userProfiles.length,
    userProfiles,
    jobs: listVideoJobs(tenantId)
  });
});

adminTikTokRouter.post("/admin/tiktok-shop/sync-showcase", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const products = await fetchShowcaseProducts(tenantId);

  res.status(200).json({
    status: "synced",
    tenantId,
    syncedAt: new Date().toISOString(),
    products
  });
});

adminTikTokRouter.post("/admin/tiktok-shop/auto-video", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const { productIds, durationSec = 25, tone = "energetic" } = req.body as {
    productIds?: string[];
    durationSec?: number;
    tone?: string;
  };

  const products = await fetchShowcaseProducts(tenantId);
  const selected = Array.isArray(productIds) && productIds.length > 0
    ? products.filter((product) => productIds.includes(product.id))
    : products;

  if (selected.length === 0) {
    res.status(400).json({ error: "no products available for video generation" });
    return;
  }

  const job = await generateVideoDrafts({
    tenantId,
    products: selected,
    durationSec,
    tone
  });

  res.status(201).json({
    status: "created",
    job
  });
});

adminTikTokRouter.get("/admin/tiktok-shop/intelligence", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const report = await buildShopIntelligenceReport(tenantId);
  res.status(200).json(report);
});

adminTikTokRouter.get("/admin/tiktok-shop/export", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const report = await buildShopIntelligenceReport(tenantId);
  const content = exportShopIntelligenceCsv(report);
  const filename = `tiktok_shop_${tenantId}_${Date.now()}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(content);
});
