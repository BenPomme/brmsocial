/**
 * Outbound is a hard fail in this proto.
 * Writing to Postgres (including messages_whatsapp direction=sim) is fine.
 * SMTP, WhatsApp Meta, SMS, RCS are not.
 */

export const OUTBOUND_JOB_KINDS = [
  "wa_out",
  "outreach_mail",
  "notify",
  "smtp",
  "sms",
  "rcs",
] as const;

export type OutboundJobKind = (typeof OUTBOUND_JOB_KINDS)[number];

export class OutboundRefusedError extends Error {
  constructor(kind: string) {
    super(
      `OUTBOUND_ENABLED=false — refused to run outbound worker/job kind="${kind}". Nothing was sent.`,
    );
    this.name = "OutboundRefusedError";
  }
}

export function isOutboundKind(kind: string): boolean {
  return (OUTBOUND_JOB_KINDS as readonly string[]).includes(kind);
}

export function refuseOutbound(kind: string): never {
  throw new OutboundRefusedError(kind);
}

export function assertNotOutbound(kind: string) {
  if (isOutboundKind(kind)) refuseOutbound(kind);
}
