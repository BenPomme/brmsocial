import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PLACE = "demo-cala-santcugat";

async function seedAvis(opts: {
  clientId: string;
  googleReviewId: string;
  stars: number;
  lang: string;
  author: string;
  body: string;
  status: string;
  draftText: string;
}) {
  const avis = await prisma.avis.upsert({
    where: { googleReviewId: opts.googleReviewId },
    create: {
      clientId: opts.clientId,
      googleReviewId: opts.googleReviewId,
      stars: opts.stars,
      lang: opts.lang,
      authorPublicName: opts.author,
      body: opts.body,
      status: opts.status,
    },
    update: {
      clientId: opts.clientId,
      stars: opts.stars,
      lang: opts.lang,
      authorPublicName: opts.author,
      body: opts.body,
      status: opts.status,
    },
  });
  await prisma.reponse.deleteMany({ where: { avisId: avis.id } });
  await prisma.reponse.create({
    data: {
      avisId: avis.id,
      version: 1,
      draftModel: "template",
      draftText: opts.draftText,
      actor: "agent",
    },
  });
  return avis;
}

async function main() {
  const adminHash = await bcrypt.hash("proto-admin", 10);
  const opsHash = await bcrypt.hash("proto-ops", 10);
  const clientHash = await bcrypt.hash("proto-client", 10);

  await prisma.user.upsert({
    where: { email: "admin@babyrock.local" },
    update: { role: "admin", passwordHash: adminHash, active: true },
    create: {
      email: "admin@babyrock.local",
      role: "admin",
      passwordHash: adminHash,
      active: true,
    },
  });

  const ops = await prisma.user.upsert({
    where: { email: "ops@babyrock.local" },
    update: { role: "operator", passwordHash: opsHash, active: true },
    create: {
      email: "ops@babyrock.local",
      role: "operator",
      passwordHash: opsHash,
      active: true,
    },
  });

  const cat = await prisma.scopeCategory.upsert({
    where: { slug: "restaurant" },
    update: { active: true, label: "Restaurant" },
    create: {
      slug: "restaurant",
      label: "Restaurant",
      placesType: "restaurant",
      active: true,
      source: "seed",
    },
  });

  const shop = await prisma.client.upsert({
    where: { placeId: DEMO_PLACE },
    create: {
      name: "Cala Demo",
      city: "Sant Cugat del Vallès",
      country: "ES",
      status: "proto",
      placeId: DEMO_PLACE,
      formattedAddress: "Demo only — not a Google listing",
      publishLive: false,
      managerInviteStatus: "pending",
      categoryId: cat.id,
      operatorId: ops.id,
      toneNotes: "Usted. Casa de barrio.",
    },
    update: {
      name: "Cala Demo",
      city: "Sant Cugat del Vallès",
      country: "ES",
      status: "proto",
      publishLive: false,
      categoryId: cat.id,
      operatorId: ops.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "client@babyrock.local" },
    update: { role: "client", passwordHash: clientHash, active: true, clientId: shop.id },
    create: {
      email: "client@babyrock.local",
      role: "client",
      passwordHash: clientHash,
      active: true,
      clientId: shop.id,
    },
  });

  const five = await seedAvis({
    clientId: shop.id,
    googleReviewId: "demo-cala-5",
    stars: 5,
    lang: "es",
    author: "Marta",
    body: "La paella estaba excelente y el servicio muy atento. Volveremos el sábado.",
    status: "brouillon",
    draftText:
      "Gracias Marta por tu comentario. Nos alegra que menciones la paella y el servicio. Te esperamos el sábado.",
  });

  const two = await seedAvis({
    clientId: shop.id,
    googleReviewId: "demo-cala-2",
    stars: 2,
    lang: "es",
    author: "Pau",
    body: "La espera fue eterna y el pescado llegó frío. No es lo que esperábamos.",
    status: "attente_client",
    draftText:
      "Hola Pau. Gracias por escribirnos. Hemos leído tu comentario sobre la espera y el pescado. Queremos mejorar y te escuchamos.",
  });

  await prisma.messageWhatsapp.deleteMany({
    where: { clientId: shop.id, providerMsgId: `sim:ping:${two.id}` },
  });
  await prisma.messageWhatsapp.create({
    data: {
      clientId: shop.id,
      avisId: two.id,
      direction: "sim",
      body: [
        `Avis 2★ de Pau (es)`,
        `«${two.body}»`,
        "",
        "Brouillon proposé :",
        "Hola Pau. Gracias por escribirnos. Hemos leído tu comentario sobre la espera y el pescado. Queremos mejorar y te escuchamos.",
        "",
        "Répondez OK pour valider, ou envoyez le texte à publier.",
      ].join("\n"),
      providerMsgId: `sim:ping:${two.id}`,
    },
  });

  console.log("Seeded proto accounts + fake shop Cala Demo (no Google listing, publish stays dry-run):");
  console.log("  admin@babyrock.local  / proto-admin");
  console.log("  ops@babyrock.local    / proto-ops   → file 5★ + 2★");
  console.log("  client@babyrock.local / proto-client → ping 2★");
  console.log("  shop", shop.name, shop.id);
  console.log("  avis", five.id, "(5★)", two.id, "(2★)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
