import crypto from "crypto";

type JsonRecord = Record<string, unknown>;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  open_id?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

type TikTokUserProfile = {
  avatar_url?: string;
  display_name?: string;
  open_id?: string;
  username?: string;
  bio_description?: string;
};

type UserInfoResponse = {
  data?: {
    user?: TikTokUserProfile;
  };
  error?: { code?: string; message?: string; log_id?: string };
};

const tiktokAuthorizeBaseUrl = "https://www.tiktok.com/v2/auth/authorize/";
const tiktokTokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
const tiktokUserInfoUrl = "https://open.tiktokapis.com/v2/user/info/";

function asJsonRecord(value: unknown): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as JsonRecord;
}

function normalizeScope(scope: string | undefined): string {
  if (!scope || scope.trim().length === 0) {
    return "user.info.basic";
  }

  return scope
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(",");
}

export function createState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function buildAuthorizationUrl(options: {
  clientKey: string;
  redirectUri: string;
  scope?: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_key: options.clientKey,
    redirect_uri: options.redirectUri,
    response_type: "code",
    scope: normalizeScope(options.scope),
    state: options.state
  });

  return `${tiktokAuthorizeBaseUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(options: {
  clientKey: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_key: options.clientKey,
    client_secret: options.clientSecret,
    code: options.code,
    grant_type: "authorization_code",
    redirect_uri: options.redirectUri
  });

  const response = await fetch(tiktokTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const payload = asJsonRecord(await response.json());
  if (!response.ok) {
    throw new Error(`tiktok token exchange failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  if (typeof payload.access_token !== "string") {
    throw new Error(`tiktok token exchange did not return access_token: ${JSON.stringify(payload)}`);
  }

  return {
    access_token: payload.access_token,
    expires_in: Number(payload.expires_in ?? 0),
    open_id: typeof payload.open_id === "string" ? payload.open_id : undefined,
    refresh_expires_in: typeof payload.refresh_expires_in === "number" ? payload.refresh_expires_in : undefined,
    refresh_token: typeof payload.refresh_token === "string" ? payload.refresh_token : undefined,
    scope: typeof payload.scope === "string" ? payload.scope : undefined,
    token_type: typeof payload.token_type === "string" ? payload.token_type : undefined
  };
}

export async function fetchUserInfo(accessToken: string): Promise<TikTokUserProfile | undefined> {
  const params = new URLSearchParams({ fields: "open_id,avatar_url,display_name,username,bio_description" });
  const response = await fetch(`${tiktokUserInfoUrl}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = (await response.json()) as UserInfoResponse;

  if (!response.ok || payload.error) {
    throw new Error(`tiktok user fetch failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload.data?.user;
}

export function verifyWebhookSignature(options: {
  requestBody: string;
  secret: string;
  signature: string;
  timestamp: string;
}): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", options.secret)
      .update(`${options.timestamp}.${options.requestBody}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(options.signature, "hex");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
