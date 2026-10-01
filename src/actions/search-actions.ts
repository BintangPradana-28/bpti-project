"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export interface GlobalSearchResult {
  type: "item" | "asset" | "location";
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

export async function globalSearchAction(query: string): Promise<{
  success: boolean;
  results: GlobalSearchResult[];
  error?: string;
}> {
  try {
    await requireAuth();

    const clean = query.trim();
    if (!clean || clean.length < 2) {
      return { success: true, results: [] };
    }

    const [items, assets, locations] = await Promise.all([
      // 1. Search Inventory Items
      prisma.inventoryItem.findMany({
        where: {
          OR: [
            { code: { contains: clean } },
            { name: { contains: clean } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
          category: { select: { name: true } },
        },
        take: 5,
      }),

      // 2. Search Hardware Assets
      prisma.asset.findMany({
        where: {
          OR: [
            { assetTag: { contains: clean } },
            { name: { contains: clean } },
            { serialNumber: { contains: clean } },
            { brand: { contains: clean } },
            { model: { contains: clean } },
          ],
        },
        select: {
          id: true,
          assetTag: true,
          name: true,
          status: true,
          brand: true,
          model: true,
        },
        take: 5,
      }),

      // 3. Search Locations
      prisma.location.findMany({
        where: {
          OR: [
            { code: { contains: clean } },
            { name: { contains: clean } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
        },
        take: 5,
      }),
    ]);

    const results: GlobalSearchResult[] = [];

    for (const item of items) {
      results.push({
        type: "item",
        id: item.id,
        title: item.name,
        subtitle: `Katalog: ${item.code} • Kategori: ${item.category?.name || "Umum"}`,
        badge: "Barang",
        url: `/inventory?search=${encodeURIComponent(item.code)}`,
      });
    }

    for (const asset of assets) {
      results.push({
        type: "asset",
        id: asset.id,
        title: `${asset.assetTag} - ${asset.name}`,
        subtitle: `${asset.brand || ""} ${asset.model || ""} • Status: ${asset.status}`,
        badge: "Aset",
        url: `/assets/${asset.id}`,
      });
    }

    for (const loc of locations) {
      results.push({
        type: "location",
        id: loc.id,
        title: loc.name,
        subtitle: `Kode: ${loc.code} • Tipe: ${loc.type}`,
        badge: "Lokasi",
        url: `/locations`,
      });
    }

    return { success: true, results };
  } catch (err: unknown) {
    return {
      success: false,
      results: [],
      error: err instanceof Error ? err.message : "Gagal mencari data.",
    };
  }
}
