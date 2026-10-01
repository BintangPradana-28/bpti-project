import { describe, it, expect } from "vitest";
import {
  importInventoryRowSchema,
  importAssetRowSchema,
} from "@/lib/validations/bulk-import";
import {
  generateInventoryTemplate,
  generateAssetTemplate,
  parseSpreadsheetBuffer,
} from "@/lib/bulk-import-parser";

describe("Bulk Import Validations & Parser", () => {
  describe("Inventory Row Validation", () => {
    it("validates correct inventory row data", () => {
      const row = {
        code: "BRG-NET-01",
        name: "Router Cisco Gigabit",
        categoryName: "Networking",
        unit: "Unit",
        minStock: "5",
        maxStock: "20",
        initialStock: "10",
        locationCode: "LOC-WH-1",
      };
      const result = importInventoryRowSchema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("BRG-NET-01");
        expect(result.data.minStock).toBe(5);
        expect(result.data.initialStock).toBe(10);
      }
    });

    it("rejects inventory row with empty code or negative stock", () => {
      const invalidRow = {
        code: " ",
        name: "Test Barang",
        categoryName: "Alat",
        minStock: "-2",
      };
      const result = importInventoryRowSchema.safeParse(invalidRow);
      expect(result.success).toBe(false);
    });
  });

  describe("Asset Row Validation", () => {
    it("validates correct asset row data with defaults", () => {
      const row = {
        assetTag: "AST-LAP-001",
        name: "Laptop Dell Latitude",
        condition: "GOOD",
        locationCode: "LOC-LAB-1",
      };
      const result = importAssetRowSchema.safeParse(row);
      expect(result.success).toBe(true);
    });

    it("rejects asset row with invalid condition enum", () => {
      const invalidRow = {
        assetTag: "AST-002",
        name: "Monitor LG",
        condition: "INVALID_CONDITION",
        locationCode: "LOC-1",
      };
      const result = importAssetRowSchema.safeParse(invalidRow);
      expect(result.success).toBe(false);
    });
  });

  describe("Template Generation & Parsing", () => {
    it("generates CSV and XLSX inventory templates", async () => {
      const csvTpl = await generateInventoryTemplate("csv");
      expect(csvTpl.contentType).toContain("text/csv");
      expect(csvTpl.buffer.length).toBeGreaterThan(50);

      const xlsxTpl = await generateInventoryTemplate("xlsx");
      expect(xlsxTpl.contentType).toContain("spreadsheetml");
      expect(xlsxTpl.buffer.length).toBeGreaterThan(100);
    });

    it("generates CSV and XLSX asset templates", async () => {
      const csvTpl = await generateAssetTemplate("csv");
      expect(csvTpl.contentType).toContain("text/csv");
      expect(csvTpl.buffer.length).toBeGreaterThan(50);

      const xlsxTpl = await generateAssetTemplate("xlsx");
      expect(xlsxTpl.contentType).toContain("spreadsheetml");
      expect(xlsxTpl.buffer.length).toBeGreaterThan(100);
    });

    it("parses CSV buffer correctly into normalized keys", async () => {
      const sampleCsv = Buffer.from(
        "Kode Barang,Nama Barang,Kategori,Satuan,Stok Awal\r\nBRG-01,Mouse USB,Aksesoris,Pcs,15\r\n",
        "utf-8"
      );
      const rows = await parseSpreadsheetBuffer(sampleCsv, "items.csv");
      expect(rows.length).toBe(1);
      expect(rows[0].data.code).toBe("BRG-01");
      expect(rows[0].data.name).toBe("Mouse USB");
      expect(rows[0].data.categoryName).toBe("Aksesoris");
      expect(rows[0].data.unit).toBe("Pcs");
      expect(rows[0].data.initialStock).toBe("15");
    });
  });
});
