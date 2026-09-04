export type InboundKind = "ok" | "stop" | "phone" | "text";

export function classifyInbound(body: string): InboundKind {
  const t = body.replace(/\s+/g, " ").trim();
  if (!t) return "text";
  if (/^(baja|stop|unsubscribe|no me interesa|no,?\s*gracias|no gracias)[.!\s]*$/i.test(t)) return "stop";
  if (
    /\b(ya pagu[eé]|he pagado|i (already )?paid|just paid)\b/i.test(t)
  ) {
    return "text";
  }
  if (
    /\b(pago|pagar|bizum|stripe|tarjeta|enlace|link|env[ií]a(?:\s*lo|\s*me)?|m[aá]nda(?:\s*me|\s*lo)?)\b/i.test(t) ||
    /\b(do it|send it|send the link)\b/i.test(t)
  ) {
    return "ok";
  }
  if (/^\s*(ok|vale|de acuerdo|sí|si|yes)[\s!.]*$/i.test(t)) return "ok";
  const digits = t.replace(/[^\d+]/g, "");
  if (/^\+?\d{9,15}$/.test(digits) && digits.replace(/\D/g, "").length >= 9) return "phone";
  return "text";
}
