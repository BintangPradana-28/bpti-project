/**
 * Konstanta Terpusat Aplikasi (Single Source of Truth)
 * Sesuai Project Charter & Rekonsiliasi BPTI UHAMKA 2026
 */

export const APP_CONFIG = {
  ORG_NAME: "Badan Pengembangan Teknologi Informasi",
  ORG_ACRONYM: "BPTI",
  ORG_PARENT: "Universitas Muhammadiyah Prof. DR. HAMKA (UHAMKA)",
  ORG_FULL_NAME: "Badan Pengembangan Teknologi Informasi (BPTI) UHAMKA",
  ORG_EMAIL_DOMAIN: "uhamka.ac.id",
  DEFAULT_ADMIN_EMAIL: "admin@uhamka.ac.id",
  APP_NAME: "Sistem Informasi Inventaris & Aset BPTI",
  APP_SHORT_NAME: "SIM-Inventaris BPTI",
  APP_VERSION: "1.0.0",
} as const;

export type AppConfig = typeof APP_CONFIG;
