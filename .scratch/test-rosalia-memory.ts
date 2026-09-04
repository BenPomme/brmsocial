import { extractSpokenName, personFirstName } from "../src/lib/language";
import { decideRosaliaReply } from "../src/lib/rosalia-reply";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(extractSpokenName("Hola me llamo Ben") === "Ben", "me llamo");
assert(personFirstName("Benjamin Pommeraud") === "Benjamin", "profile");
assert(extractSpokenName("Hola Rosalía") === "", "no name in hola");

const first = decideRosaliaReply({
  inbound: "Hola Rosalía",
  outboundBodies: [],
  firstName: "Ben",
});
assert(first.faqId === "hello", `first faq ${first.faqId}`);
assert(first.body.startsWith("Hola Ben,"), first.body.slice(0, 80));
assert(first.source === "template", "template not llm");

const again = decideRosaliaReply({
  inbound: "Hola",
  outboundBodies: [
    "Hola Ben, soy Rosalia de Babyrock Social. Respondemos las reseñas de Google de su negocio por 89 € al mes.",
  ],
  firstName: "Ben",
});
assert(again.faqId === "hello", `again faq ${again.faqId}`);
assert(/Hola de nuevo Ben/.test(again.body), again.body.slice(0, 80));

const noName = decideRosaliaReply({ inbound: "Hola", outboundBodies: [] });
assert(noName.body.startsWith("Hola, soy Rosalia"), noName.body.slice(0, 80));

console.log("ok", first.body.split("\n")[0], "|", again.body.split("\n")[0]);
