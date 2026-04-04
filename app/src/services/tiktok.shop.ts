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

export type TikTokShopUserProfile = {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  source: "tiktok_shop" | "local_orders";
};

export type ShopIntelligenceReport = {
  tenantId: string;
  generatedAt: string;
  products: ShowcaseProduct[];
  userProfiles: TikTokShopUserProfile[];
  aiSummary: string;
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
  const result = await db.query<{
    id: number | string;
    name: string | null;
    description: string | null;
    price: number | string | null;
    stock: number | string | null;
  }>(
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

async function loadTikTokUserProfilesFromApi(): Promise<TikTokShopUserProfile[]> {
  if (!env.tiktokShopApiBaseUrl || !env.tiktokShopAccessToken) {
    return [];
  }

  const response = await fetch(`${env.tiktokShopApiBaseUrl}/users`, {
    headers: {
      Authorization: `Bearer ${env.tiktokShopAccessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`tiktok user profile sync failed: ${response.status}`);
  }

  const json = (await response.json()) as { users?: Array<Record<string, unknown>> };
  const users = json.users ?? [];

  return users.map((user) => ({
    id: readString(user.user_id || user.id, crypto.randomUUID()),
    username: readString(user.username, "unknown"),
    nickname: readString(user.nickname || user.display_name),
    email: readString(user.email),
    phone: readString(user.phone),
    orderCount: readNumber(user.order_count),
    totalSpent: readNumber(user.total_spent),
    source: "tiktok_shop" as const
  }));
}

async function loadLocalUserProfiles(tenantId: string): Promise<TikTokShopUserProfile[]> {
  const result = await db.query<{
    user_id: string | null;
    order_count: number | string | null;
    total_spent: number | string | null;
  }>(
    `SELECT user_id,
            COUNT(*)::int AS order_count,
            COALESCE(SUM(total), 0)::float8 AS total_spent
     FROM orders
     WHERE tenant_id = $1
     GROUP BY user_id
     ORDER BY total_spent DESC
     LIMIT 100`,
    [tenantId]
  );

  return result.rows.map((row) => ({
    id: readString(row.user_id),
    username: readString(row.user_id, "unknown"),
    nickname: "",
    email: "",
    phone: "",
    orderCount: readNumber(row.order_count),
    totalSpent: readNumber(row.total_spent),
    source: "local_orders" as const
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

export async function fetchShopUserProfiles(tenantId: string): Promise<TikTokShopUserProfile[]> {
  try {
    const profiles = await loadTikTokUserProfilesFromApi();
    if (profiles.length > 0) {
      return profiles;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("fallback to local order profiles for tiktok users", error);
  }

  return loadLocalUserProfiles(tenantId);
}

export async function buildShopIntelligenceReport(tenantId: string): Promise<ShopIntelligenceReport> {
  const [products, userProfiles] = await Promise.all([
    fetchShowcaseProducts(tenantId),
    fetchShopUserProfiles(tenantId)
  ]);

  const topProducts = products.slice(0, 5).map((product) => `${product.title} (฿${product.price})`).join(", ");
  const topUsers = userProfiles
    .slice(0, 5)
    .map((profile) => `${profile.username}: ${profile.orderCount} orders, ฿${profile.totalSpent}`)
    .join(", ");

  const aiSummary = await generateReply([
    "You are an ecommerce analyst for TikTok Shop.",
    `Tenant: ${tenantId}`,
    `Products count: ${products.length}`,
    `User profile count: ${userProfiles.length}`,
    `Top products: ${topProducts || "N/A"}`,
    `Top users: ${topUsers || "N/A"}`,
    "Provide concise insights: key opportunities, risks, and 3 recommendations."
  ].join("\n"));

  return {
    tenantId,
    generatedAt: new Date().toISOString(),
    products,
    userProfiles,
    aiSummary
  };
}

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, "\"\"");
  return `"${escaped}"`;
}

export function exportShopIntelligenceCsv(report: ShopIntelligenceReport): string {
  const lines: string[] = [];

  lines.push(["section", "id", "name", "description", "price", "stock", "source"].join(","));
  for (const product of report.products) {
    lines.push([
      escapeCsv("product"),
      escapeCsv(product.id),
      escapeCsv(product.title),
      escapeCsv(product.description),
      escapeCsv(String(product.price)),
      escapeCsv(String(product.stock)),
      escapeCsv(product.source)
    ].join(","));
  }

  lines.push("");
  lines.push(["section", "id", "username", "nickname", "email", "phone", "order_count", "total_spent", "source"].join(","));
  for (const user of report.userProfiles) {
    lines.push([
      escapeCsv("user_profile"),
      escapeCsv(user.id),
      escapeCsv(user.username),
      escapeCsv(user.nickname),
      escapeCsv(user.email),
      escapeCsv(user.phone),
      escapeCsv(String(user.orderCount)),
      escapeCsv(String(user.totalSpent)),
      escapeCsv(user.source)
    ].join(","));
  }

  lines.push("");
  lines.push(["section", "ai_summary"].join(","));
  lines.push([escapeCsv("insight"), escapeCsv(report.aiSummary)].join(","));

  return lines.join("\n");
}

function parseHashtags(script: string): string[] {
  const matches = script.match(/#[a-zA-Z0-9_]+/g) ?? [];
  return Array.from(new Set(matches.map((tag) => tag.toLowerCase()))).slice(0, 8);
}

function parseShotPlan(script: string): string[] {
  const lines = script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+[).-]/.test(line) || line.toLowerCase().startsWith("scene"));

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
