import ExcelJS from "exceljs";

export interface ParsedSpreadsheetRow {
  rowNumber: number;
  data: Record<string, unknown>;
}

/**
 * Normalisasi nama header agar tahan terhadap perbedaan huruf besar/kecil dan spasi
 */
function normalizeHeaderKey(key: string): string {
  const clean = key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Mapping sinonim kolom inventaris
  if (clean === "kode" || clean === "kodebarang" || clean === "itemcode" || clean === "code") return "code";
  if (clean === "namabarang" || clean === "nama" || clean === "itemname" || clean === "name") return "name";
  if (clean === "kategori" || clean === "category" || clean === "namakategori") return "categoryName";
  if (clean === "satuan" || clean === "unit") return "unit";
  if (clean === "minstock" || clean === "stokminimum" || clean === "stokmin") return "minStock";
  if (clean === "maxstock" || clean === "stokmaksimum" || clean === "stokmax") return "maxStock";
  if (clean === "initialstock" || clean === "stokawal" || clean === "stok" || clean === "jumlah") return "initialStock";
  if (clean === "locationcode" || clean === "kodelokasi" || clean === "lokasi" || clean === "location") return "locationCode";

  // Mapping sinonim kolom aset
  if (clean === "assettag" || clean === "tagaset" || clean === "tagid" || clean === "kodetag") return "assetTag";
  if (clean === "namaaset" || clean === "perangkat" || clean === "namaperangkat") return "name";
  if (clean === "serialnumber" || clean === "nomorseri" || clean === "sn") return "serialNumber";
  if (clean === "brand" || clean === "merek" || clean === "merk") return "brand";
  if (clean === "model" || clean === "tipe" || clean === "modeltype") return "model";
  if (clean === "condition" || clean === "kondisi" || clean === "kondisifisik") return "condition";
  if (clean === "departmentcode" || clean === "kodedepartemen" || clean === "departemen") return "departmentCode";
  if (clean === "purchasecost" || clean === "biaya" || clean === "hargapengadaan" || clean === "biayapengadaan") return "purchaseCost";
  if (clean === "purchasedate" || clean === "tanggalpengadaan" || clean === "tanggalbeli") return "purchaseDate";

  return key.trim();
}

/**
 * Parsing berkas Excel XLSX atau CSV dari Buffer
 */
export async function parseSpreadsheetBuffer(
  buffer: Buffer,
  filename: string
): Promise<ParsedSpreadsheetRow[]> {
  const isCsv = filename.toLowerCase().endsWith(".csv");
  const workbook = new ExcelJS.Workbook();

  if (isCsv) {
    // Parser teks CSV
    const text = buffer.toString("utf-8").replace(/^\uFEFF/, ""); // hapus BOM
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      throw new Error("Berkas CSV kosong atau tidak memiliki baris data setelah header.");
    }

    const headerLine = lines[0];
    const rawHeaders = headerLine.split(",").map((h) => h.replace(/^"|"$/g, "").trim());
    const mappedKeys = rawHeaders.map(normalizeHeaderKey);

    const rows: ParsedSpreadsheetRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex parsing CSV handling escaped commas inside quotes
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ""));

      const rowObj: Record<string, unknown> = {};
      mappedKeys.forEach((key, colIdx) => {
        const rawVal = values[colIdx];
        if (rawVal !== undefined && rawVal !== "") {
          rowObj[key] = rawVal;
        }
      });

      if (Object.keys(rowObj).length > 0) {
        rows.push({
          rowNumber: i + 1,
          data: rowObj,
        });
      }
    }
    return rows;
  }

  // Parser XLSX via ExcelJS
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Berkas spreadsheet tidak memiliki lembar kerja (worksheet).");
  }

  const headerRow = worksheet.getRow(1);
  const headerKeys: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headerKeys[colNumber] = normalizeHeaderKey(String(cell.value || ""));
  });

  const parsedRows: ParsedSpreadsheetRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Lewati header
    const rowObj: Record<string, unknown> = {};
    let hasValue = false;

    row.eachCell((cell, colNumber) => {
      const key = headerKeys[colNumber];
      if (key && cell.value !== null && cell.value !== undefined) {
        // Ekstrak teks bersih jika format cell richText / formula
        let val: unknown = cell.value;
        if (typeof val === "object" && val !== null && "text" in val) {
          val = (val as { text: unknown }).text;
        } else if (typeof val === "object" && val !== null && "result" in val) {
          val = (val as { result: unknown }).result;
        }
        rowObj[key] = val;
        hasValue = true;
      }
    });

    if (hasValue) {
      parsedRows.push({
        rowNumber,
        data: rowObj,
      });
    }
  });

  return parsedRows;
}

/**
 * Generator Template Impor Katalog Inventaris
 */
export async function generateInventoryTemplate(
  format: "csv" | "xlsx"
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  const headers = [
    "Kode Barang",
    "Nama Barang",
    "Kategori",
    "Satuan",
    "Stok Minimum",
    "Stok Maksimum",
    "Stok Awal",
    "Kode Lokasi",
  ];

  const sampleRows = [
    ["BRG-LAN-001", "Kabel UTP Cat6 305M", "Networking", "Roll", 5, 20, 10, "LOC-WH-A"],
    ["BRG-RJ45-001", "Konektor RJ45 Cat6 (Isi 50)", "Networking", "Box", 10, 50, 25, "LOC-WH-A"],
    ["BRG-MOU-001", "Mouse Optik USB Logitech", "Periferal", "Pcs", 15, 100, 30, "LOC-WH-A"],
  ];

  if (format === "csv") {
    const bom = "\uFEFF";
    const content =
      bom +
      [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
    return {
      buffer: Buffer.from(content, "utf-8"),
      contentType: "text/csv; charset=utf-8",
      filename: "template-import-inventaris.csv",
    };
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Template Inventaris");
  ws.addRow(headers);
  const headRow = ws.getRow(1);
  headRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  sampleRows.forEach((r) => ws.addRow(r));
  ws.columns.forEach((col) => {
    col.width = 22;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: "template-import-inventaris.xlsx",
  };
}

/**
 * Generator Template Impor Master Aset
 */
export async function generateAssetTemplate(
  format: "csv" | "xlsx"
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  const headers = [
    "Tag Aset",
    "Nama Aset",
    "Nomor Seri",
    "Merek",
    "Model",
    "Kondisi",
    "Kode Lokasi",
    "Kode Departemen",
    "Biaya Pengadaan",
    "Tanggal Pengadaan",
  ];

  const sampleRows = [
    [
      "AST-LAP-001",
      "Laptop ThinkPad T14 Gen 4",
      "SN-PF4X9012",
      "Lenovo",
      "ThinkPad T14",
      "EXCELLENT",
      "LOC-LAB-1",
      "DEPT-IT",
      18500000,
      "2026-01-15",
    ],
    [
      "AST-SWT-001",
      "Switch Managed 24-Port Gigabit",
      "SN-CISCO-8821",
      "Cisco",
      "Catalyst 2960",
      "GOOD",
      "LOC-SRV-1",
      "DEPT-IT",
      8200000,
      "2026-02-10",
    ],
  ];

  if (format === "csv") {
    const bom = "\uFEFF";
    const content =
      bom +
      [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
    return {
      buffer: Buffer.from(content, "utf-8"),
      contentType: "text/csv; charset=utf-8",
      filename: "template-import-aset.csv",
    };
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Template Aset");
  ws.addRow(headers);
  const headRow = ws.getRow(1);
  headRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  sampleRows.forEach((r) => ws.addRow(r));
  ws.columns.forEach((col) => {
    col.width = 24;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: "template-import-aset.xlsx",
  };
}
