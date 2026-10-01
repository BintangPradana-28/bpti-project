import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_CONFIG } from "@/lib/constants";

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const bom = "\uFEFF"; // UTF-8 Byte Order Mark for Microsoft Excel compatibility
  const headerLine = headers.map(escapeCsvCell).join(",");
  const rowLines = rows.map((r) => r.map(escapeCsvCell).join(","));
  return bom + [headerLine, ...rowLines].join("\r\n");
}

export async function generateXlsx(
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = `${APP_CONFIG.ORG_ACRONYM} UHAMKA - ${APP_CONFIG.APP_NAME}`;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Laporan", {
    views: [{ showGridLines: true }],
  });

  // Title Row
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = APP_CONFIG.ORG_FULL_NAME.toUpperCase();
  titleCell.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 24;

  // Subtitle Row
  worksheet.mergeCells(2, 1, 2, headers.length);
  const subtitleCell = worksheet.getCell(2, 1);
  subtitleCell.value = `${title} • Dibuat pada: ${new Date().toLocaleString("id-ID")}`;
  subtitleCell.font = { italic: true, size: 10, color: { argb: "FF475569" } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 18;

  // Empty Spacer Row
  worksheet.getRow(3).height = 10;

  // Headers Row (Row 4)
  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // Slate-800
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });

  // Data Rows
  rows.forEach((row, rowIndex) => {
    const dataRow = worksheet.addRow(row.map((val) => (val === null || val === undefined ? "-" : val)));
    dataRow.height = 19;
    const isEven = rowIndex % 2 === 0;
    dataRow.eachCell((cell) => {
      cell.font = { size: 9, color: { argb: "FF1E293B" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" }, // Clean zebra stripe
      };
      cell.border = {
        top: { style: "hair", color: { argb: "FFE2E8F0" } },
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
        left: { style: "hair", color: { argb: "FFE2E8F0" } },
        right: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  });

  // Column auto-fit width calculation
  headers.forEach((h, colIndex) => {
    let maxLen = h.length;
    rows.forEach((r) => {
      const val = r[colIndex];
      const strLen = val ? String(val).length : 1;
      if (strLen > maxLen) {
        maxLen = strLen;
      }
    });
    const col = worksheet.getColumn(colIndex + 1);
    col.width = Math.min(Math.max(maxLen + 4, 12), 40);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generatePdf(
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Promise<Buffer> {
  const isLandscape = headers.length > 6;
  const doc = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(APP_CONFIG.ORG_FULL_NAME.toUpperCase(), pageWidth / 2, 35, {
    align: "center",
  });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(title, pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Waktu Cetak: ${new Date().toLocaleString("id-ID")} • Total Baris Data: ${rows.length}`,
    pageWidth / 2,
    63,
    { align: "center" }
  );

  // Table
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((c) => (c === null || c === undefined ? "-" : String(c)))),
    startY: 75,
    margin: { top: 75, left: 25, right: 25, bottom: 35 },
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Halaman ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        str,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 15,
        { align: "center" }
      );
    },
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
