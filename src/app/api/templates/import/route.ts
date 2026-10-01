import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import {
  generateInventoryTemplate,
  generateAssetTemplate,
} from "@/lib/bulk-import-parser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inventory";
    const format = (searchParams.get("format") || "xlsx").toLowerCase() as "csv" | "xlsx";

    let templateResult: { buffer: Buffer; contentType: string; filename: string };

    if (type === "assets") {
      templateResult = await generateAssetTemplate(format);
    } else {
      templateResult = await generateInventoryTemplate(format);
    }

    return new Response(new Uint8Array(templateResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": templateResult.contentType,
        "Content-Disposition": `attachment; filename="${templateResult.filename}"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengunduh template import" },
      { status: 500 }
    );
  }
}
