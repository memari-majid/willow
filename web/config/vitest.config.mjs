import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(configDir, "..");

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
});
