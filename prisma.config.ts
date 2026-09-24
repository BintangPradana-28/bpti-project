import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "mysql://bpti_user:bpti_secret_2026@localhost:3306/bpti_db",
  },
});
