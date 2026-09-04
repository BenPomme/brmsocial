import { prisma } from "../src/lib/db";

async function main() {
  const threads = await prisma.inboxThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 8,
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      lead: { select: { name: true, city: true } },
    },
  });
  for (const t of threads) {
    console.log(
      "\n====",
      t.channel,
      t.counterparty,
      "phase=" + t.phase,
      "lang=" + t.preferredLang,
      "status=" + t.status,
      "city=" + t.city,
      "lead=" + (t.lead?.name ?? "-"),
      "last=" + t.lastMessageAt.toISOString(),
    );
    for (const m of t.messages) {
      const p = m.payload as { faqId?: string; source?: string; phase?: string } | null;
      const meta = p?.faqId || p?.source ? ` [${p.source || ""} ${p.faqId || ""} ${p.phase || ""}]` : "";
      console.log(
        m.createdAt.toISOString(),
        m.direction.padEnd(5),
        (m.body || "").replace(/\n/g, " | ").slice(0, 400) + meta,
      );
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
