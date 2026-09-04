import { ingestInbound } from "../src/lib/inbox";
import { emitRosaliaEvent } from "../src/lib/rosalia-reply";
import { prisma } from "../src/lib/db";

const from = "34600113002";

async function say(body: string) {
  const r = await ingestInbound({
    channel: "whatsapp",
    counterparty: from,
    body,
    providerId: `sim-nuria-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    payload: { simulated: true, mediaType: "text" },
  });
  const t = await prisma.inboxThread.findUnique({
    where: { id: r.threadId },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 4 } },
  });
  const lastOut = t?.messages.find((m) => m.direction === "out" || m.direction === "draft");
  console.log("IN:", body);
  console.log("PHASE:", t?.phase, "LANG:", t?.preferredLang, "STEP:", t?.onboardingStep);
  console.log("OUT:", (lastOut?.body ?? "").slice(0, 280).replace(/\n/g, " | "));
  console.log("---");
  return r.threadId;
}

async function main() {
  const id = await say("Hola, tinc una floristeria a Sant Cugat");
  await say("no sé què és un gestor");
  await say("ok");
  const existing = await prisma.client.findFirst({ where: { whatsappOwner: from } });
  const client =
    existing ??
    (await prisma.client.create({
      data: {
        name: "Flors Núria",
        city: "Sant Cugat del Vallès",
        country: "ES",
        status: "paye",
        whatsappOwner: from,
      },
    }));
  if (existing) {
    await prisma.client.update({ where: { id: existing.id }, data: { status: "paye", city: "Sant Cugat del Vallès" } });
  }
  await prisma.inboxThread.update({ where: { id }, data: { clientId: client.id } });
  await emitRosaliaEvent({ threadId: id, event: { type: "payment_confirmed", via: "stripe" } });
  const t = await prisma.inboxThread.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 2 } },
  });
  console.log("AFTER PAY phase", t?.phase, t?.onboardingStep);
  console.log("OUT:", t?.messages[0]?.body?.slice(0, 280).replace(/\n/g, " | "));
  await ingestInbound({
    channel: "whatsapp",
    counterparty: from,
    body: "(image)",
    providerId: `sim-nuria-img-${Date.now()}`,
    payload: { simulated: true, mediaType: "image" },
  });
  const t2 = await prisma.inboxThread.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 2 } },
  });
  console.log("AFTER PHOTO", t2?.messages.find((m) => m.direction === "out")?.body?.slice(0, 280).replace(/\n/g, " | "));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
