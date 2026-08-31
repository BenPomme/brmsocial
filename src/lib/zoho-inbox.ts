import { ingestInbound } from "./inbox";
import { listZohoAccounts, outreachFrom, zohoGet } from "./zoho-mail";

type Folder = { folderId?: string | number; id?: string | number; folderName?: string; name?: string };
type ListItem = {
  messageId?: string | number;
  fromAddress?: string;
  sender?: string;
  from?: string;
  subject?: string;
  summary?: string;
  snippet?: string;
};

function asList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { list?: unknown[] }).list)) {
    return (data as { list: unknown[] }).list;
  }
  return [];
}

function folderIsInbox(f: Folder) {
  const n = (f.folderName ?? f.name ?? "").toLowerCase();
  return n === "inbox" || n.includes("inbox") || n === "boîte de réception";
}

function senderOf(item: ListItem) {
  const raw = item.fromAddress || item.sender || item.from || "";
  const m = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return (m?.[0] ?? raw).trim().toLowerCase();
}

export async function syncZohoInbox() {
  const { token, accounts } = await listZohoAccounts();
  const account = accounts[0];
  if (!account?.accountId) {
    return { scanned: 0, created: 0, errors: ["no Zoho accountId"] };
  }

  const errors: string[] = [];
  let folderId: string | number | undefined;
  try {
    const foldersJson = await zohoGet(`/api/accounts/${account.accountId}/folders`, token);
    const folders = asList(foldersJson.data) as Folder[];
    const inbox =
      folders.find(folderIsInbox) ??
      folders.find((f) => String(f.folderId ?? f.id) === "0") ??
      folders[0];
    folderId = inbox?.folderId ?? inbox?.id;
  } catch (e) {
    errors.push(`folders: ${e instanceof Error ? e.message : String(e)}`);
  }

  const viewPath = folderId
    ? `/api/accounts/${account.accountId}/messages/view?folderId=${folderId}&limit=40`
    : `/api/accounts/${account.accountId}/messages/view?limit=40`;
  const listJson = await zohoGet(viewPath, token);
  const items = asList(listJson.data) as ListItem[];
  const ours = outreachFrom().toLowerCase();
  let created = 0;

  for (const item of items) {
    const id = item.messageId;
    if (id == null) continue;
    const from = senderOf(item);
    if (!from || from === ours) continue;
    let body = item.summary || item.snippet || "";
    try {
      const contentPath = folderId
        ? `/api/accounts/${account.accountId}/folders/${folderId}/messages/${id}/content`
        : `/api/accounts/${account.accountId}/messages/${id}/originalmessage`;
      const contentJson = await zohoGet(contentPath, token);
      const d = contentJson.data as { content?: string; messageBody?: string } | undefined;
      body = (d?.content || d?.messageBody || body || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } catch (e) {
      errors.push(`content ${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
    const res = await ingestInbound({
      channel: "email",
      counterparty: from,
      body: body || "(sans texte)",
      subject: item.subject ?? null,
      providerId: `zoho-${id}`,
      payload: item,
    });
    if (res.created) created += 1;
  }

  return { scanned: items.length, created, errors };
}
