# BPTI Inventory & Asset Management System

A production-grade, modular monolith web application designed to centralize and control organization-wide inventory items, individually tracked assets with QR barcode scanning, transactional stock movements, hierarchical locations, maintenance workflows, operational KPI monitoring, and an immutable audit trail.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI & Components**: React 19, Tailwind CSS v4, Lucide React
- **Database**: MySQL 8.4 LTS
- **ORM & Driver**: Prisma ORM 7.x (`@prisma/adapter-mariadb`)
- **Authentication**: Better Auth
- **Validation**: Zod
- **Testing**: Vitest

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 24 LTS
- pnpm
- Docker (optional for local MySQL container)

### 2. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup
Start local MySQL with Docker Compose:
```bash
docker compose up -d
```

Generate the Prisma Client and push the schema:
```bash
npx prisma generate
npx prisma db push
```

Seed initial baseline data (Admin account, sample assets, categories, items, and location hierarchy):
```bash
npx ts-node prisma/seed.ts
```

### 5. Start Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the monitoring dashboard.

---

## 🧪 Testing

Run automated unit and integration tests:
```bash
pnpm test
```

Type check:
```bash
npx tsc --noEmit
```
