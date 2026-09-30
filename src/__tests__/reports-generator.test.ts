import { describe, it, expect } from "vitest";
import {
  generateCsv,
  generateXlsx,
  generatePdf,
} from "@/lib/reports-generator";

describe("Reports Generator Utility", () => {
  const headers = ["Kode", "Nama Barang", "Kategori", "Stok"];
  const rows = [
    ["BRG-001", "Kabel LAN Cat6", "Networking", 50],
    ["BRG-002", "Switch 24-Port", "Hardware", 12],
    ["BRG-003", "Mouse Optik, USB", "Accessories", 0],
  ];

  it("generates CSV with UTF-8 BOM and properly escapes commas", () => {
    const csv = generateCsv(headers, rows);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Kode,Nama Barang,Kategori,Stok");
    expect(csv).toContain('"Mouse Optik, USB"');
    expect(csv).toContain("BRG-001");
  });

  it("generates XLSX binary buffer using ExcelJS", async () => {
    const buffer = await generateXlsx("Laporan Uji Coba Inventaris", headers, rows);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    // Excel file PK zip signature
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it("generates PDF binary buffer using jsPDF and autoTable", async () => {
    const buffer = await generatePdf("Laporan Uji Coba Inventaris", headers, rows);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    // PDF magic number %PDF
    const pdfHeader = buffer.subarray(0, 4).toString("ascii");
    expect(pdfHeader).toBe("%PDF");
  });
});
