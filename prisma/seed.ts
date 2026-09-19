import { PrismaClient, MovementType, AssetStatus, AssetCondition, LocationType } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BPTI Database Seeding...");

  // 1. Roles & Permissions
  const roles = [
    { name: "SUPER_ADMIN", description: "Full system administration and oversight" },
    { name: "INVENTORY_ADMIN", description: "Full management of items, stock movements, and ledger" },
    { name: "IT_STAFF", description: "Hardware asset assignments, transfers, and maintenance" },
    { name: "MANAGER", description: "Operational monitoring, approvals, and reports access" },
    { name: "AUDITOR", description: "Read-only access to historical ledgers and immutable audit logs" },
    { name: "VIEWER", description: "Restricted read-only operational visibility" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  console.log("✓ Roles seeded");

  // 2. Departments
  const itDept = await prisma.department.upsert({
    where: { code: "DEPT-IT" },
    update: {},
    create: {
      code: "DEPT-IT",
      name: "IT & Telecommunications",
      description: "Information technology systems, infrastructure, and support",
    },
  });

  const labDept = await prisma.department.upsert({
    where: { code: "DEPT-LAB" },
    update: {},
    create: {
      code: "DEPT-LAB",
      name: "Testing & Certification Lab",
      description: "Testing equipment, calibration, and experimental assets",
    },
  });
  console.log("✓ Departments seeded");

  // 3. Super Admin User
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bpti.go.id" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@bpti.go.id",
      emailVerified: true,
      roleId: superAdminRole?.id,
      departmentId: itDept.id,
      isActive: true,
    },
  });
  console.log("✓ Super Admin seeded: admin@bpti.go.id");

  // 4. Locations Tree
  const hq = await prisma.location.upsert({
    where: { code: "LOC-HQ" },
    update: {},
    create: {
      code: "LOC-HQ",
      name: "BPTI Central Complex",
      type: LocationType.ORGANIZATION,
      departmentId: itDept.id,
    },
  });

  const mainBldg = await prisma.location.upsert({
    where: { code: "LOC-BLDG-A" },
    update: {},
    create: {
      code: "LOC-BLDG-A",
      name: "Building A (Technology Center)",
      type: LocationType.BUILDING,
      parentId: hq.id,
      departmentId: itDept.id,
    },
  });

  const serverRoom = await prisma.location.upsert({
    where: { code: "LOC-SRV-01" },
    update: {},
    create: {
      code: "LOC-SRV-01",
      name: "Main Data Center & Server Room",
      type: LocationType.ROOM,
      parentId: mainBldg.id,
      departmentId: itDept.id,
    },
  });

  const warehouse = await prisma.location.upsert({
    where: { code: "LOC-WH-01" },
    update: {},
    create: {
      code: "LOC-WH-01",
      name: "Central Logistics Warehouse",
      type: LocationType.ROOM,
      parentId: mainBldg.id,
      departmentId: itDept.id,
    },
  });
  console.log("✓ Locations hierarchy seeded");

  // 5. Categories
  const catCables = await prisma.category.upsert({
    where: { code: "CAT-CBL" },
    update: {},
    create: { code: "CAT-CBL", name: "Network & Cabling", description: "Ethernet, fiber, patch cords" },
  });

  const catHardware = await prisma.category.upsert({
    where: { code: "CAT-HDW" },
    update: {},
    create: { code: "CAT-HDW", name: "Computer Hardware & Servers", description: "Laptops, servers, workstations" },
  });
  console.log("✓ Categories seeded");

  // 6. Inventory Items
  const cableCat6 = await prisma.inventoryItem.upsert({
    where: { code: "BPTI-INV-001" },
    update: {},
    create: {
      code: "BPTI-INV-001",
      name: "UTP Cable Cat6 Belden (305m)",
      description: "High speed Gigabit Cat6 unshielded twisted pair cable roll",
      categoryId: catCables.id,
      unit: "roll",
      minStock: 3,
      maxStock: 50,
      isActive: true,
    },
  });

  const rj45 = await prisma.inventoryItem.upsert({
    where: { code: "BPTI-INV-002" },
    update: {},
    create: {
      code: "BPTI-INV-002",
      name: "RJ45 Modular Connector Plug (Box of 100)",
      description: "Cat6 8P8C Gold Plated Network Connector",
      categoryId: catCables.id,
      unit: "box",
      minStock: 10,
      maxStock: 200,
      isActive: true,
    },
  });
  console.log("✓ Inventory Items seeded");

  // 7. Initial Stock & Movement
  await prisma.stock.upsert({
    where: {
      itemId_locationId: {
        itemId: cableCat6.id,
        locationId: warehouse.id,
      },
    },
    update: { quantity: 18 },
    create: {
      itemId: cableCat6.id,
      locationId: warehouse.id,
      quantity: 18,
    },
  });

  await prisma.stockMovement.create({
    data: {
      itemId: cableCat6.id,
      locationId: warehouse.id,
      type: MovementType.IN,
      quantity: 18,
      previousQty: 0,
      resultingQty: 18,
      referenceNumber: "PO-2026-0012",
      reason: "Initial baseline procurement intake",
      actorId: adminUser.id,
    },
  });
  console.log("✓ Stock and historical movement ledger seeded");

  // 8. Individual Assets with QR Codes
  const qr1 = await QRCode.toDataURL(JSON.stringify({ system: "BPTI", tag: "BPTI-LAP-0001", sn: "5CD3240XYZ" }));
  await prisma.asset.upsert({
    where: { assetTag: "BPTI-LAP-0001" },
    update: {},
    create: {
      assetTag: "BPTI-LAP-0001",
      serialNumber: "5CD3240XYZ",
      name: "Dell Latitude 5540 Enterprise Laptop",
      brand: "Dell",
      model: "Latitude 5540 Core i7 / 32GB / 1TB SSD",
      itemId: null,
      locationId: mainBldg.id,
      departmentId: itDept.id,
      holderId: adminUser.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.ASSIGNED,
      purchaseCost: 24500000,
      qrCode: qr1,
      notes: "Assigned for primary system engineering management",
    },
  });

  const qr2 = await QRCode.toDataURL(JSON.stringify({ system: "BPTI", tag: "BPTI-SRV-0001", sn: "7X89B102" }));
  await prisma.asset.upsert({
    where: { assetTag: "BPTI-SRV-0001" },
    update: {},
    create: {
      assetTag: "BPTI-SRV-0001",
      serialNumber: "7X89B102",
      name: "Dell PowerEdge R750 Rack Server",
      brand: "Dell",
      model: "PowerEdge R750 2x Xeon Silver / 128GB ECC",
      itemId: null,
      locationId: serverRoom.id,
      departmentId: itDept.id,
      holderId: null,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      purchaseCost: 145000000,
      qrCode: qr2,
      notes: "Primary production database server node",
    },
  });
  console.log("✓ Assets with QR codes seeded");

  // 9. Audit log entry
  await prisma.auditLog.create({
    data: {
      action: "system.seed",
      entity: "Database",
      actorId: adminUser.id,
      notes: "Initial system bootstrap and baseline seeding completed",
    },
  });
  console.log("✓ System bootstrap audit recorded");

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
