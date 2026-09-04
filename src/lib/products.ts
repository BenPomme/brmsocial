export const PRODUCT_IDS = ["social", "direct", "pack", "whatsapp_setup"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];
export type ProductStatus = "live" | "coming_soon";

export type Product = {
  id: ProductId;
  name: string;
  status: ProductStatus;
};

export const PRODUCTS: Record<ProductId, Product> = {
  social: { id: "social", name: "BabyRock Social", status: "live" },
  direct: { id: "direct", name: "BabyRock Direct", status: "coming_soon" },
  pack: { id: "pack", name: "BabyRock Social + Direct", status: "coming_soon" },
  whatsapp_setup: { id: "whatsapp_setup", name: "Direct setup", status: "coming_soon" },
};

export function isProductLive(id: ProductId): boolean {
  return PRODUCTS[id].status === "live";
}
