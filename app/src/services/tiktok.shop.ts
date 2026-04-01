import crypto from "crypto";
import { db } from "../db.js";
import { generateReply } from "./ai.js";
import { env } from "../utils/env.js";

export type ShowcaseProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  source: "tiktok_showcase" | "local_products";
};

type VideoDraft = {
  productId: string;
  script: string;
  hashtags: string[];
  shotPlan: string[];
};

type VideoAutomationJob = {
  id: string;
  tenantId: string;
  createdAt: string;
  status: "completed";
  tone: string;
  durationSec: number;
  drafts: VideoDraft[];
};

const jobsByTenant = new Map<string, VideoAutomationJob[]>();

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function loadLocalProducts(tenantId: string): Promise<ShowcaseProduct[]> {
  const result = await db.query(
    `SELECT id, name, description, price, stock
     FROM products
     WHERE tenant_id = $1
     ORDER BY id DESC
     LIMIT 50`,
    [tenantId]
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    title: readString(row.name),
    description: readString(row.description),
    price: readNumber(row.price),
    stock: readNumber(row.stock),
    source: "local_products" as const
  }));
}

async function loadTikTokShowcaseFromApi(): Promise<ShowcaseProduct[]> {
  if (!env.tiktokShopApiBaseUrl || !env.tiktokShopAccessToken) {
    return [];
  }

  const response = await fetch(`${env.tiktokShopApiBaseUrl}/products`, {
    headers: {
      Authorization: `Bearer ${env.tiktokShopAccessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`tiktok showcase sync failed: ${response.status}`);
  }

  const json = (await response.json()) as { products?: Array<Record<string, unknown>> };
  const products = json.products ?? [];

  return products.map((product) => ({
    id: readString(product.product_id || product.id, crypto.randomUUID()),
    title: readString(product.title || product.name, "Untitled product"),
    description: readString(product.description),
    price: readNumber(product.price),
    stock: readNumber(product.stock),
    source: "tiktok_showcase" as const
  }));
}

export async function fetchShowcaseProducts(tenantId: string): Promise<ShowcaseProduct[]> {
  try {
    const tiktokProducts = await loadTikTokShowcaseFromApi();
    if (tiktokProducts.length > 0) {
      return tiktokProducts;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("fallback to local products for tiktok showcase", error);
  }

  return loadLocalProducts(tenantId);
}

function parseHashtags(script: string): string[] {
  const matches = script.match(/#[a-zA-Z0-9_]+/g) ?? [];
  return Array.from(new Set(matches.map((tag) => tag.toLowerCase()))).slice(0, 8);
}

function parseShotPlan(script: string): string[] {
  const lines = script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+[\).\-]/.test(line) || line.toLowerCase().startsWith("scene"));

  return lines.slice(0, 6);
}

export async function generateVideoDrafts(input: {
  tenantId: string;
  products: ShowcaseProduct[];
  durationSec: number;
  tone: string;
}): Promise<VideoAutomationJob> {
  const selected = input.products.slice(0, 5);

  const drafts: VideoDraft[] = await Promise.all(
    selected.map(async (product) => {
      const prompt = [
        "You are a TikTok Shop video producer.",
        `Write a ${input.durationSec}-second TikTok video script in tone: ${input.tone}.`,
        "Include a strong hook, product highlight, social proof, CTA, scene-by-scene list, and hashtags.",
        `Product name: ${product.title}`,
        `Description: ${product.description || "N/A"}`,
        `Price: ${product.price}`,
        `Stock: ${product.stock}`
      ].join("\n");

      const script = await generateReply(prompt);

      return {
        productId: product.id,
        script,
        hashtags: parseHashtags(script),
        shotPlan: parseShotPlan(script)
      };
    })
  );

  const job: VideoAutomationJob = {
    id: `job_${Date.now()}`,
    tenantId: input.tenantId,
    createdAt: new Date().toISOString(),
    status: "completed",
    tone: input.tone,
    durationSec: input.durationSec,
    drafts
  };

  const jobs = jobsByTenant.get(input.tenantId) ?? [];
  jobs.unshift(job);
  jobsByTenant.set(input.tenantId, jobs.slice(0, 20));

  return job;
}

export function listVideoJobs(tenantId: string): VideoAutomationJob[] {
  return jobsByTenant.get(tenantId) ?? [];
}
