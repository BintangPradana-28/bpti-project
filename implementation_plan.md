# Implementation Plan for BPTI Inventory & Asset Management System

## Goal Description

Create a production‑grade, modular monolith web application that satisfies the functional and non‑functional requirements outlined in the **SRS**, **AGENTS**, and **AI Coding Master Rules**. The system will be built with the verified technology baseline (Next.js 16, TypeScript, pnpm, Prisma 7, MySQL 8.4, Better Auth, Tailwind v4, shadcn/ui, etc.) and will deliver secure, accessible, performant, testable, observable, and deployable inventory & asset management capabilities.

---

## User Review Required

> [!IMPORTANT]
> The following items require explicit confirmation before any code is written:
> 
> - **Monitoring Scope** – Confirm whether the monitoring dashboard should include only inventory/asset KPIs (baseline) or also endpoint/device telemetry (future scope). 
> - **QR Code Asset Identification** – Is QR scanning a phase‑one requirement? 
> - **Attachments / File Uploads** – Should assets support file attachments now, and if so, preferred storage (object storage vs. DB BLOB). 
> - **Exact Database Schema** – Final field list for inventory items, assets, locations, maintenance, etc. (many fields are marked `[TBD]` in the SRS). 
> - **RBAC Role & Permission Set** – Confirm the candidate roles/permissions or provide a finalized list. 
> - **Legal State Transitions** – Approve the asset lifecycle states and any additional custom transitions. 
> - **Deployment Target** – Confirm Docker‑based local dev environment and any cloud target (e.g., GCP, AWS). 

---

## Open Questions

> [!WARNING]
> - **Monitoring Detail** – Which KPIs are *must‑have* for the initial release? Do we need configurable alerts? 
> - **QR Implementation** – Will the QR payload contain only the asset ID, or additional encrypted data? 
> - **File Upload Constraints** – Max file size, allowed MIME types, virus scanning requirements? 
> - **Concurrency Handling** – Preferred approach for stock‑out/adjustment (optimistic locking, SELECT FOR UPDATE, etc.)? 
> - **Audit Log Storage** – Store audit entries in a separate MySQL table or external logging service? 
> - **Internationalisation** – Is i18n required at launch? 
> - **Testing Coverage** – Target unit test coverage percentage? 

---

## Proposed Changes

### Repository & Tooling Setup

- **[NEW]** `package.json` – Initialize with `pnpm init -y`, add dependencies for Next.js 16, React 19, TypeScript, Prisma 7, Better Auth, Tailwind v4, shadcn/ui, Lucide‑React, Zod, React Hook Form, TanStack Table, Recharts, Pino, Vitest, React Testing Library, Playwright.
- **[NEW]** `tsconfig.json` – TypeScript configuration aligned with Next.js.
- **[NEW]** `prisma/schema.prisma` – Define database models for User, Role, Permission, InventoryItem, Stock, StockMovement, Asset, Location, Assignment, Transfer, Maintenance, AuditLog, etc.
- **[NEW]** `.env.example` – List required environment variables (DB URL, AUTH secrets, etc.).
- **[NEW]** `docker-compose.yml` – Services: `app` (Node), `db` (MySQL 8.4).
- **[NEW]** CI workflow `.github/workflows/ci.yml` – Lint, type‑check, test, build.

### Core Modules (Domain Packages)

#### Authentication & Authorization
- Implement Better Auth integration using server actions for login/logout.
- Server‑side RBAC middleware checking roles/permissions.

#### Users & Access
- CRUD API routes and UI pages for user management (admin only).
- Role & permission management UI.

#### Inventory
- API & UI for inventory items, stock display, stock‑in/out, adjustments.
- Server‑side transaction handling for stock mutations (Prisma `transaction`).

#### Assets
- CRUD for assets, QR code generation/display, assignment & transfer flows.
- Enforce legal state transitions (server validation).

#### Locations
- Hierarchical location model (organization → building → floor → room).
- UI for location tree management.

#### Maintenance
- Maintenance request creation, status workflow, linkage to assets.

#### Monitoring Dashboard
- Server‑side route delivering KPI data.
- Client component using Recharts/TanStack Table to render KPI cards and tables.
- Optional alert badges for low‑stock, overdue maintenance (configurable).

#### Reporting
- Export endpoints (CSV/Excel) for inventory, asset, movement logs.

#### Audit Log
- Centralized audit table; middleware auto‑writes audit entries for protected actions.

#### Notifications (phase‑one placeholder)
- Basic email notification stub; can be expanded later.

### Testing Strategy

- **Unit Tests** – Vitest for pure functions, Prisma model helpers.
- **Component Tests** – React Testing Library for UI components.
- **E2E Tests** – Playwright covering login, stock transaction, asset transfer, monitoring view.

### Observability & Logging

- Structured logs with Pino (request ID, user ID, action).
- Optional integration with Sentry (future).

---

## Verification Plan

### Automated Tests
- Run `pnpm test` (Vitest + RTL) on every push via GitHub Actions.
- Run `pnpm e2e` (Playwright) on PRs.

### Manual Verification
- Deploy the Docker compose stack locally and perform end‑to‑end sanity checks:
  1. Sign‑up/Login flow.
  2. Create inventory item, perform stock‑in/out, verify ledger.
  3. Create asset, assign, transfer, check lifecycle.
  4. View monitoring dashboard KPIs update correctly.
  5. Audit log entries appear for each mutation.

### Regression Checks
- After each feature branch merge, the CI pipeline will execute the full test suite.
- Periodic performance audit (Lighthouse) on critical pages.

---

*Prepared by the engineering agent following the AGENTS.md operating profile and the AI Coding Master Rules. Awaiting user confirmation on the open questions and review items above before proceeding to implementation.*
