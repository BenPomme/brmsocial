import { PRODUCTS } from "../products";

/** BabyRock Direct. Not sold. Do not import this from pay or from Social workers. */
export const PRODUCT_ID = PRODUCTS.direct.id;
export const PRODUCT_NAME = PRODUCTS.direct.name;
export const STATUS = PRODUCTS.direct.status;

export function isDirectSold(): boolean {
  return STATUS === "live";
}
