import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    globals: true,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || "mysql://mock_test:mock_test@localhost:3306/test_bpti",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
