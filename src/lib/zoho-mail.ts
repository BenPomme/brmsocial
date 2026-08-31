function readEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v == null || v.trim() === "") return undefined;
  return v.trim().replace(/^["']|["']$/g, "");
}

export class ZohoMailError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "ZohoMailError";
  }
}

function accountsBase() {
  return readEnv("ZOHO_ACCOUNTS_API") ?? "https://accounts.zoho.eu";
}

function mailBase() {
  return readEnv("ZOHO_MAIL_API") ?? "https://mail.zoho.eu";
}

export function outreachFrom() {
  return readEnv("OUTREACH_FROM") ?? "rosalia@babyrock.ai";
}

export function outreachAllowlist(): string[] {
  const raw = readEnv("OUTREACH_ALLOWLIST") ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlisted(to: string) {
  const list = outreachAllowlist();
  return list.includes(to.trim().toLowerCase());
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

export async function refreshAccessToken(): Promise<string> {
  const clientId = readEnv("ZOHO_CLIENT_ID");
  const clientSecret = readEnv("ZOHO_CLIENT_SECRET");
  const refresh = readEnv("ZOHO_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refresh) {
    throw new ZohoMailError("ZOHO_CLIENT_ID / SECRET / REFRESH_TOKEN missing in .env", 0, "");
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refresh,
  });
  const res = await fetch(`${accountsBase()}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TokenResponse;
  if (!json.access_token) {
    throw new ZohoMailError(
      `Zoho token refresh failed: ${json.error ?? res.status} ${json.error_description ?? ""}`.trim(),
      res.status,
      JSON.stringify({ error: json.error, error_description: json.error_description }),
    );
  }
  return json.access_token;
}

export async function zohoGet(path: string, token: string) {
  const res = await fetch(`${mailBase()}${path}`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let json: { status?: { code?: number; description?: string }; data?: unknown };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new ZohoMailError(`Zoho non-JSON ${res.status}`, res.status, text.slice(0, 400));
  }
  const code = json.status?.code ?? res.status;
  if (code !== 200) {
    throw new ZohoMailError(
      `Zoho ${path} ${code}: ${json.status?.description ?? res.statusText}`,
      code,
      text.slice(0, 800),
    );
  }
  return json;
}

async function zohoPost(path: string, token: string, payload: unknown) {
  const res = await fetch(`${mailBase()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json: { status?: { code?: number; description?: string }; data?: unknown };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new ZohoMailError(`Zoho non-JSON ${res.status}`, res.status, text.slice(0, 400));
  }
  const code = json.status?.code ?? res.status;
  if (code !== 200) {
    throw new ZohoMailError(
      `Zoho POST ${path} ${code}: ${json.status?.description ?? res.statusText}`,
      code,
      text.slice(0, 800),
    );
  }
  return json;
}

export type ZohoAccount = {
  accountId: string;
  mailboxAddress?: string;
  primaryEmailAddress?: string;
};

export async function listZohoAccounts() {
  const token = await refreshAccessToken();
  const json = await zohoGet("/api/accounts", token);
  const rows = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
  const accounts: ZohoAccount[] = (rows as Array<Record<string, unknown>>).map((row) => ({
    accountId: String(row.accountId ?? row.account_id ?? ""),
    mailboxAddress: typeof row.mailboxAddress === "string" ? row.mailboxAddress : undefined,
    primaryEmailAddress:
      typeof row.primaryEmailAddress === "string"
        ? row.primaryEmailAddress
        : typeof row.emailAddress === "string"
          ? row.emailAddress
          : undefined,
  }));
  return { token, accounts };
}

export async function sendZohoMail(opts: {
  to: string;
  subject: string;
  content: string;
  mailFormat?: "html" | "plaintext";
}) {
  const to = opts.to.trim();
  if (!isAllowlisted(to)) {
    throw new ZohoMailError(
      `Refused: ${to} is not on OUTREACH_ALLOWLIST. Nothing was sent.`,
      403,
      "",
    );
  }
  const from = outreachFrom();
  const { token, accounts } = await listZohoAccounts();
  const match =
    accounts.find((a) => (a.mailboxAddress ?? a.primaryEmailAddress ?? "").toLowerCase() === from.toLowerCase()) ??
    accounts[0];
  if (!match?.accountId) {
    throw new ZohoMailError("No Zoho Mail accountId on this token. Re-do consent as Rosalia.", 0, "");
  }
  const json = await zohoPost(`/api/accounts/${match.accountId}/messages`, token, {
    fromAddress: from,
    toAddress: to,
    subject: opts.subject,
    content: opts.content,
    mailFormat: opts.mailFormat ?? "plaintext",
  });
  const data = (json.data ?? {}) as { messageId?: string; mailId?: string };
  return {
    from,
    to,
    accountId: match.accountId,
    mailbox: match.mailboxAddress ?? match.primaryEmailAddress ?? null,
    messageId: data.messageId ?? null,
    mailId: data.mailId ?? null,
  };
}
