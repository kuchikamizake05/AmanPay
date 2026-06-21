import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/features/deals/model/*.ts",
        "src/features/deals/components/deal-status.tsx",
        "src/lib/stellar/codec.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
