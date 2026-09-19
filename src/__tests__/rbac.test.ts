import { describe, it, expect } from "vitest";
import { PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, hasPermission } from "@/lib/rbac";

describe("RBAC Access Control", () => {
  it("should grant full permissions to SUPER_ADMIN", () => {
    const adminPerms = ROLE_DEFAULT_PERMISSIONS.SUPER_ADMIN;
    expect(hasPermission(adminPerms, PERMISSIONS.INVENTORY_CREATE)).toBe(true);
    expect(hasPermission(adminPerms, PERMISSIONS.AUDIT_READ)).toBe(true);
    expect(hasPermission(adminPerms, PERMISSIONS.USER_MANAGE)).toBe(true);
  });

  it("should enforce least privilege on VIEWER", () => {
    const viewerPerms = ROLE_DEFAULT_PERMISSIONS.VIEWER;
    expect(hasPermission(viewerPerms, PERMISSIONS.INVENTORY_READ)).toBe(true);
    expect(hasPermission(viewerPerms, PERMISSIONS.ASSET_READ)).toBe(true);

    // Forbidden mutations for VIEWER
    expect(hasPermission(viewerPerms, PERMISSIONS.INVENTORY_CREATE)).toBe(false);
    expect(hasPermission(viewerPerms, PERMISSIONS.STOCK_ADJUST)).toBe(false);
    expect(hasPermission(viewerPerms, PERMISSIONS.ASSET_ASSIGN)).toBe(false);
    expect(hasPermission(viewerPerms, PERMISSIONS.USER_MANAGE)).toBe(false);
  });

  it("should permit AUDITOR read-only access to audit logs and reports", () => {
    const auditorPerms = ROLE_DEFAULT_PERMISSIONS.AUDITOR;
    expect(hasPermission(auditorPerms, PERMISSIONS.AUDIT_READ)).toBe(true);
    expect(hasPermission(auditorPerms, PERMISSIONS.REPORT_EXPORT)).toBe(true);
    expect(hasPermission(auditorPerms, PERMISSIONS.INVENTORY_CREATE)).toBe(false);
  });
});
