import catalog from "../../../content/public-demo.json";
export const demoCatalog = catalog;
export type PublicExample = Pick<(typeof catalog.examples)[number], "id" | "label">;
