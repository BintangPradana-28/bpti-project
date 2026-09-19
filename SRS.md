# SRS.md — Software Requirements Specification
# BPTI Inventory & Asset Management System

**Document type:** Software Requirements Specification (SRS)  
**Project:** BPTI Inventory & Asset Management System  
**Client technology constraints:** Next.js + MySQL  
**Team:** System Analyst + QA Tester + Full-stack Developer  
**Document status:** Draft baseline / requirements for validation  
**Version:** 1.0.0  
**Date:** 2026-09-19

---

# 1. PURPOSE OF THIS DOCUMENT

This SRS defines the functional, non-functional, data, security, workflow, monitoring, testing, and operational requirements for the BPTI Inventory & Asset Management System.

This document is the primary product-requirement reference for implementation.

It intentionally separates:

- confirmed project constraints;
- proposed functional scope;
- assumptions;
- unresolved client questions;
- recommendations.

A requirement marked `TBD` or `OPEN` must not be silently treated as a confirmed client decision.

---

# 2. REQUIREMENT STATUS LEGEND

Use these labels throughout the project:

| Label | Meaning |
|---|---|
| `[CONFIRMED]` | Explicitly established by the project/client context |
| `[USER-PROVIDED]` | Explicitly supplied by the user/team |
| `[PROPOSED]` | Engineering recommendation awaiting confirmation |
| `[ASSUMPTION]` | Temporary assumption used to enable planning |
| `[TBD]` | Must be confirmed |
| `[OPEN]` | Unresolved requirement |
| `[OPTIONAL]` | May be implemented if scope/time permits |
| `[FUTURE]` | Outside current baseline |
| `[VERIFIED]` | Verified against a current authoritative technical source |

---

# 3. EXECUTIVE SYSTEM DEFINITION

## 3.1 Product

`[CONFIRMED]`

The product is a web-based BPTI Inventory & Asset Management System.

The system is intended to centralize and control:

- inventory records;
- individually tracked assets;
- stock;
- stock movements;
- locations;
- asset assignments;
- asset transfers;
- maintenance;
- operational monitoring;
- reports;
- users;
- permissions;
- audit trails.

## 3.2 Client technology constraint

`[CONFIRMED]`

The client requires:

- Next.js as the web application framework;
- MySQL as the primary database.

## 3.3 Team structure

`[USER-PROVIDED]`

The project team consists of:

| Role | Responsibility |
|---|---|
| System Analyst | requirements, analysis, business processes, documentation |
| QA Tester | quality assurance, test strategy, verification, regression |
| Full-stack Developer | application, database, security, integration, deployment |

## 3.4 Monitoring requirement

`[CONFIRMED]`

The client has stated that the system needs a monitoring feature.

The exact meaning of “monitoring” is currently:

`[OPEN]`

Current safe planning interpretation:

`[ASSUMPTION]` inventory/asset operational monitoring.

The alternative interpretation “technical endpoint monitoring” remains a separate potential scope.

---

# 4. PROBLEM STATEMENT

The system should provide a controlled source of truth for inventory and asset information.

The project should reduce common operational problems associated with fragmented inventory management, including:

- difficulty locating assets;
- uncertain stock quantities;
- weak transaction history;
- unclear ownership/assignment;
- poor visibility into damaged/maintenance assets;
- insufficient auditability;
- slow reporting;
- manual reconciliation.

The precise current-state process and existing system must be validated with the client.

---

# 5. OBJECTIVES

## 5.1 Primary objectives

The system should:

1. centralize inventory and asset data;
2. support controlled inventory transactions;
3. track individual assets where required;
4. preserve movement and lifecycle history;
5. provide operational monitoring;
6. provide role-based access;
7. support auditability;
8. support operational reporting;
9. maintain database consistency under concurrent use;
10. provide a maintainable architecture suitable for a small development team.

## 5.2 Quality objectives

The system should be:

- secure;
- accessible;
- responsive;
- testable;
- maintainable;
- performant;
- observable;
- recoverable.

---

# 6. SCOPE

## 6.1 In scope — baseline

`[PROPOSED BASELINE]`

```text
Authentication
Authorization / RBAC
User Management
Department
Category
Inventory Item
Stock
Stock Movement
Asset
Location
Asset Assignment
Asset Transfer
Maintenance
Monitoring
Audit Log
Reporting
Search
Filtering
```

## 6.2 Recommended phase-one additions

`[PROPOSED]`

- QR code asset identification;
- stock opname;
- import CSV/XLSX;
- attachments;
- notifications;
- approval workflow.

## 6.3 Future scope

`[FUTURE]`

- real-time endpoint/device telemetry;
- CPU/RAM/disk monitoring;
- network monitoring;
- predictive inventory forecasting;
- advanced analytics;
- broader mobile/PWA capabilities;
- external API ecosystem.

These should not enter the baseline without approved scope.

---

# 7. OUT OF SCOPE BY DEFAULT

Unless explicitly approved, the baseline does not include:

- accounting;
- payroll;
- HRIS;
- ERP;
- full procurement suite;
- full warehouse management platform;
- microservice architecture;
- Kubernetes orchestration;
- event streaming platform;
- AI assistant/chatbot;
- predictive analytics;
- endpoint agent infrastructure.

---

# 8. STAKEHOLDERS

The exact organization chart is `[TBD]`.

Expected stakeholder categories:

| Stakeholder | Interest |
|---|---|
| BPTI Management | visibility, reports, accountability |
| Inventory/Admin Staff | day-to-day inventory operations |
| IT Staff | IT assets and maintenance |
| Staff/Asset Holders | assigned assets and returns |
| Auditor | historical records and auditability |
| System Administrator | access and system configuration |
| Project System Analyst | requirements |
| Project Full-stack Developer | implementation |
| Project QA Tester | verification |

---

# 9. PERSONAS

## 9.1 Super Administrator

Needs:

- complete system access;
- user/role management;
- system visibility;
- audit visibility.

## 9.2 Inventory Administrator

Needs:

- item management;
- stock transactions;
- asset operations;
- reporting.

## 9.3 IT Staff

Needs:

- assets;
- maintenance;
- assignments;
- technical notes where authorized.

## 9.4 Manager

Needs:

- monitoring;
- reports;
- approvals where applicable.

## 9.5 Auditor

Needs:

- read-only historical visibility;
- audit trails;
- reports.

## 9.6 Viewer

Needs:

- restricted read-only information.

These personas and permissions require client confirmation before production authorization is finalized.

---

# 10. BUSINESS DEFINITIONS

## 10.1 Inventory Item

A type/category of material or product tracked primarily by quantity.

Example:

```text
Cable LAN Cat6
Quantity = 100
```

## 10.2 Asset

An individually tracked physical object.

Example:

```text
Laptop
Asset ID = BPTI-LAP-0001
Serial Number = ...
```

## 10.3 Stock

Current quantity available for an inventory item under a defined stock/location context.

## 10.4 Stock Movement

A historical transaction that increases, decreases, returns, or adjusts stock.

## 10.5 Assignment

The act of associating an asset with a person/holder and possibly a location.

## 10.6 Transfer

A change in asset location and/or holder that must be historically traceable.

## 10.7 Maintenance

A controlled process for repair, service, inspection, or related asset lifecycle activities.

## 10.8 Monitoring

Operational visibility over the state of inventory/assets and important exceptions.

---

# 11. FUNCTIONAL REQUIREMENTS

# FR-AUTH — Authentication

## FR-AUTH-001 — User Login

`[PROPOSED]`

The system shall allow authorized users to authenticate.

Acceptance criteria:

- valid credentials create an authenticated session;
- invalid credentials do not create a session;
- security-sensitive errors do not expose secrets;
- login attempts are appropriately logged where required.

## FR-AUTH-002 — Logout

The system shall allow authenticated users to terminate their session.

## FR-AUTH-003 — Session Security

The system shall maintain secure server-side session behavior.

## FR-AUTH-004 — Password Recovery

`[TBD]`

Provide password reset if the client requires local credential administration.

## FR-AUTH-005 — Account Verification

`[TBD]`

Email verification requirements require client confirmation.

---

# FR-ACCESS — Authorization

## FR-ACCESS-001 — Role-Based Access Control

The system shall enforce RBAC server-side.

## FR-ACCESS-002 — Permission Checks

Protected actions shall validate authorization before mutation.

## FR-ACCESS-003 — Forbidden Access

Unauthorized access shall return an appropriate forbidden response.

## FR-ACCESS-004 — Resource-Level Authorization

Users shall not access a resource merely because they know its identifier.

---

# FR-USER — User Management

## FR-USER-001

Authorized administrators shall be able to view users.

## FR-USER-002

Authorized administrators shall be able to create users when allowed.

## FR-USER-003

Authorized administrators shall be able to update users when allowed.

## FR-USER-004

Authorized administrators shall be able to deactivate users when allowed.

Deletion behavior is `[TBD]`; prefer deactivation when historical records depend on the user.

## FR-USER-005

Users may belong to departments where business requirements require it.

---

# FR-ROLE — Role and Permission Management

## FR-ROLE-001

Authorized administrators shall manage roles.

## FR-ROLE-002

Authorized administrators shall assign permissions according to policy.

## FR-ROLE-003

Permission changes shall be auditable.

---

# FR-ORG — Department Management

## FR-ORG-001

The system should support departments if department-based assignment/reporting is required.

## FR-ORG-002

Department relationships shall not be duplicated inconsistently across records.

---

# FR-CATEGORY — Category Management

## FR-CATEGORY-001

Authorized users shall create categories.

## FR-CATEGORY-002

Authorized users shall update categories.

## FR-CATEGORY-003

Category removal behavior shall preserve historical integrity.

If an item has historical records, physical deletion may be prohibited in favor of deactivation.

---

# FR-ITEM — Inventory Item Management

## FR-ITEM-001

The system shall maintain item master data.

Candidate fields:

- item ID;
- item code;
- name;
- category;
- unit;
- description;
- minimum stock;
- maximum stock;
- status.

Exact fields are `[TBD]`.

## FR-ITEM-002 — Item Search

Users shall be able to search authorized item records.

## FR-ITEM-003 — Item Filtering

Users shall be able to filter items by applicable attributes.

## FR-ITEM-004 — Item Detail

Authorized users shall be able to inspect an item record and related stock information.

---

# FR-STOCK — Stock Management

## FR-STOCK-001

The system shall show the current stock quantity.

## FR-STOCK-002

The system shall preserve stock movement history.

## FR-STOCK-003 — Stock In

Authorized users shall be able to record inbound stock.

## FR-STOCK-004 — Stock Out

Authorized users shall be able to record outbound stock.

## FR-STOCK-005 — Return

Authorized users shall be able to record returned stock when applicable.

## FR-STOCK-006 — Adjustment

Authorized users shall be able to request/perform stock adjustments according to authorization policy.

## FR-STOCK-007 — Negative Stock Protection

The system shall reject stock transactions that create an invalid negative quantity unless the client explicitly authorizes a negative-stock model.

Default policy:

`[PROPOSED] negative stock prohibited.`

## FR-STOCK-008 — Atomicity

A valid stock transaction shall update all required records atomically.

---

# FR-MOVE — Stock Movement

## FR-MOVE-001

Each stock transaction shall create a historical movement record.

## FR-MOVE-002

Movement records shall include enough information for audit and reporting.

Candidate fields:

- date/time;
- item;
- type;
- quantity;
- previous quantity;
- resulting quantity;
- actor;
- reason;
- reference;
- location.

Exact schema is `[TBD]`.

---

# FR-ASSET — Asset Management

## FR-ASSET-001

The system shall support individually tracked assets.

Candidate fields:

- asset ID;
- asset tag;
- serial number;
- item;
- brand;
- model;
- purchase date;
- warranty;
- location;
- holder;
- condition;
- status.

Exact fields are `[TBD]`.

## FR-ASSET-002

Asset identifiers shall be unique.

## FR-ASSET-003

Asset serial number uniqueness behavior shall be defined by policy.

## FR-ASSET-004

The system shall display asset lifecycle history.

## FR-ASSET-005

The system shall prevent unauthorized asset mutation.

---

# FR-ASSET-STATE — Asset Lifecycle

Candidate states:

```text
AVAILABLE
ASSIGNED
IN_USE
IN_REPAIR
DAMAGED
LOST
RETIRED
DISPOSED
```

The exact state list is `[TBD]`.

## FR-ASSET-STATE-001

The server shall enforce legal state transitions.

## FR-ASSET-STATE-002

Clients shall not directly set arbitrary state values without transition validation.

---

# FR-ASSIGN — Asset Assignment

## FR-ASSIGN-001

Authorized users shall be able to assign an asset.

## FR-ASSIGN-002

An assignment shall preserve history.

Candidate fields:

- asset;
- holder;
- location;
- actor;
- assignedAt;
- condition;
- notes;
- returnAt;
- approval reference where required.

## FR-ASSIGN-003

The system shall prevent contradictory current assignments.

---

# FR-TRANSFER — Asset Transfer

## FR-TRANSFER-001

Authorized users shall be able to transfer assets.

## FR-TRANSFER-002

The system shall preserve previous and new assignment/location information.

## FR-TRANSFER-003

Transfers shall be auditable.

## FR-TRANSFER-004

Transfers shall be transactional.

---

# FR-LOCATION — Location Management

## FR-LOCATION-001

The system shall support physical locations where needed.

Possible hierarchy:

```text
Organization
  ↓
Building
  ↓
Floor
  ↓
Room
```

This hierarchy is `[PROPOSED]` and requires client confirmation.

## FR-LOCATION-002

Assets may be associated with authorized locations.

## FR-LOCATION-003

Location changes shall be historically traceable where required.

---

# FR-MAINT — Maintenance

## FR-MAINT-001

Authorized users shall create maintenance records/requests.

## FR-MAINT-002

Maintenance shall reference a relevant asset where applicable.

## FR-MAINT-003

The system shall record maintenance status.

Candidate states:

```text
REQUESTED
APPROVED
IN_PROGRESS
WAITING_PART
COMPLETED
CANCELLED
```

Exact states are `[TBD]`.

## FR-MAINT-004

The system shall preserve maintenance history.

## FR-MAINT-005

The system may support maintenance cost and technician information if required.

---

# FR-MONITOR — Monitoring

## FR-MONITOR-001

The system shall provide an operational monitoring dashboard.

## FR-MONITOR-002

The dashboard should provide relevant inventory KPIs.

Candidate KPIs:

- total assets;
- available;
- assigned;
- damaged;
- lost;
- retired;
- low stock;
- out of stock;
- maintenance due;
- maintenance overdue;
- overdue returns.

## FR-MONITOR-003

The dashboard shall identify attention-required conditions.

## FR-MONITOR-004

Monitoring indicators should link to actionable records where the workflow permits.

## FR-MONITOR-005

Monitoring figures shall be derived from authoritative application/database state.

## FR-MONITOR-006

Synthetic/fake KPI values shall not appear in production.

## FR-MONITOR-007

Real-time requirements are `[TBD]`.

Default baseline:

`[ASSUMPTION] near-current data through server-side querying and appropriate refresh/revalidation.`

---

# FR-AUDIT — Audit Trail

## FR-AUDIT-001

The system shall maintain an audit trail for critical mutations.

## FR-AUDIT-002

Audit records shall identify the actor.

## FR-AUDIT-003

Audit records shall identify the affected resource.

## FR-AUDIT-004

Audit records should record before/after state for high-value mutations where appropriate.

## FR-AUDIT-005

Normal users shall not be able to arbitrarily alter or delete audit history.

---

# FR-REPORT — Reporting

## FR-REPORT-001

Authorized users shall be able to generate inventory reports.

## FR-REPORT-002

Authorized users shall be able to generate asset reports.

## FR-REPORT-003

Authorized users shall be able to generate movement reports.

## FR-REPORT-004

Authorized users shall be able to generate maintenance reports.

## FR-REPORT-005

Authorized users shall be able to generate audit reports according to permission.

## FR-REPORT-006

Export format requirements are `[TBD]`.

Recommended baseline:

- CSV/XLSX first;
- PDF where business need exists.

---

# FR-SEARCH — Search and Filtering

## FR-SEARCH-001

The system shall provide search for relevant inventory and asset records.

Candidate search fields:

- name;
- item code;
- asset ID;
- asset tag;
- serial number;
- brand;
- model;
- holder;
- location.

## FR-SEARCH-002

The system shall support filtering where datasets require it.

Candidate filters:

- category;
- status;
- condition;
- location;
- department;
- holder;
- maintenance state;
- date.

---

# FR-IMPORT — Bulk Import

`[OPTIONAL]`

## FR-IMPORT-001

The system may support CSV/XLSX import.

## FR-IMPORT-002

Imports shall validate data before mutation.

## FR-IMPORT-003

Imports shall detect duplicates and invalid rows.

## FR-IMPORT-004

Imports shall provide a result summary.

---

# FR-QR — QR Asset Identification

`[OPTIONAL / RECOMMENDED]`

## FR-QR-001

The system may generate a QR identifier for individually tracked assets.

## FR-QR-002

Scanning a QR shall resolve the asset identity.

## FR-QR-003

The resolved asset still requires normal authorization.

---

# FR-ATTACH — Attachments

`[OPTIONAL]`

Candidate attachment types:

- asset photo;
- condition photo;
- invoice;
- maintenance document;
- handover document;
- other authorized evidence.

File security requirements apply.

---

# FR-NOTIFY — Notifications

`[OPTIONAL]`

Potential notification events:

- low stock;
- overdue return;
- maintenance due;
- approval request;
- failed/exceptional workflow;
- user/account event.

Delivery channels are `[TBD]`.

---

# 12. BUSINESS RULES

## BR-001 — Authorization

Every protected mutation shall be server-authorized.

## BR-002 — Data Integrity

Critical domain mutations shall preserve relational integrity.

## BR-003 — Stock Integrity

Stock cannot be reduced below the allowed minimum business state.

Default:

`[PROPOSED] no negative stock.`

## BR-004 — History Preservation

Assignment/transfer/maintenance/stock movement history must be preserved.

## BR-005 — State Transition

Asset statuses must follow legal transitions.

## BR-006 — Auditability

Critical mutations must produce audit evidence.

## BR-007 — Untrusted Client

Client input is untrusted.

## BR-008 — Server Authority

The server determines security-sensitive fields.

## BR-009 — Concurrency

Concurrent operations must maintain business invariants.

## BR-010 — No Fake Data

Production monitoring and reports must use real system data.

---

# 13. ASSET LIFECYCLE MODEL

Proposed baseline:

```text
              ┌─────────────┐
              │  AVAILABLE  │
              └──────┬──────┘
                     │ assign
                     ▼
              ┌─────────────┐
              │  ASSIGNED   │
              └──────┬──────┘
                     │
             ┌───────┼─────────┐
             │       │         │
          return   transfer  damage
             │       │         │
             ▼       │         ▼
        AVAILABLE    │      DAMAGED
                     │
                     ▼
                  ASSIGNED

ASSIGNED
   │
   └── maintenance
          ↓
      IN_REPAIR
          │
          ├── complete → AVAILABLE / ASSIGNED
          └── fail → DAMAGED

DAMAGED
   └── retire/dispose → RETIRED / DISPOSED
```

The exact legal transitions must be confirmed during analysis.

---

# 14. STOCK FLOW

Proposed baseline:

```text
Stock In
  ↓
Stock Ledger
  ↓
Current Quantity
  ↓
Stock Out / Return / Adjustment
  ↓
Ledger
  ↓
Monitoring
  ↓
Reports
```

A stock value without its historical movement record is insufficient for auditability.

---

# 15. ASSET ASSIGNMENT FLOW

```text
Select Asset
  ↓
Validate Asset State
  ↓
Validate User/Holder
  ↓
Authorize Actor
  ↓
Create Assignment
  ↓
Update Current Asset State
  ↓
Write History
  ↓
Write Audit
  ↓
Commit
```

---

# 16. TRANSFER FLOW

```text
Select Asset
  ↓
Validate Current State
  ↓
Choose New Holder/Location
  ↓
Authorize
  ↓
Create Transfer Record
  ↓
Update Current State
  ↓
Write History
  ↓
Write Audit
  ↓
Commit
```

---

# 17. MAINTENANCE FLOW

```text
Request
  ↓
Authorize/Approve when required
  ↓
Start Maintenance
  ↓
IN_PROGRESS
  ↓
Complete
  ↓
Update Asset State
  ↓
Write Maintenance History
  ↓
Audit
```

---

# 18. MONITORING MODEL

Monitoring should combine domain signals:

```text
Inventory
  ├─ Stock
  ├─ Items
  └─ Movements

Assets
  ├─ Status
  ├─ Assignments
  ├─ Transfers
  └─ Verification

Maintenance
  ├─ Due
  ├─ Overdue
  └─ In Repair

Governance
  ├─ Audit
  └─ Pending Approvals
```

Output:

```text
Observation
  ↓
Detection
  ↓
Attention signal
  ↓
Action
```

---

# 19. ROLE-PERMISSION MATRIX

This is a baseline proposal and must be approved by the System Analyst/client.

| Permission | Super Admin | Inventory Admin | IT Staff | Manager | Auditor | Viewer |
|---|---:|---:|---:|---:|---:|---:|
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View inventory | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage items | ✓ | ✓ | maybe | — | — | — |
| Stock in/out | ✓ | ✓ | maybe | — | — | — |
| Stock adjustment | ✓ | ✓ | restricted | approve/view | view | — |
| Manage assets | ✓ | ✓ | ✓ | — | — | — |
| Assign asset | ✓ | ✓ | ✓ | approve/view | — | — |
| Transfer asset | ✓ | ✓ | ✓ | approve/view | — | — |
| Maintenance | ✓ | ✓ | ✓ | view | view | — |
| Reports | ✓ | ✓ | ✓ | ✓ | ✓ | restricted |
| Audit | ✓ | restricted | — | restricted | ✓ | — |
| User management | ✓ | restricted | — | — | — | — |
| Role management | ✓ | — | — | — | — | — |

“maybe”, “restricted”, and “approve/view” are intentionally unresolved business policy points.

---

# 20. DATA MODEL — CONCEPTUAL

Expected conceptual entities:

```text
User
Role
Permission
RolePermission
Department

Category
Item

Location

Asset
AssetStatusHistory
AssetAssignment
AssetTransfer

Stock
StockMovement
StockAdjustment

MaintenanceRequest
MaintenanceRecord

AuditLog
Notification
Attachment
```

This is a conceptual model, not a final database schema.

The System Analyst must validate:

- cardinality;
- required fields;
- optional fields;
- deletion policy;
- uniqueness;
- lifecycle;
- historical requirements.

---

# 21. DATA INTEGRITY REQUIREMENTS

The database should enforce appropriate:

- primary keys;
- foreign keys;
- uniqueness;
- nullability;
- check-like application constraints where MySQL behavior requires it;
- indexes;
- referential integrity.

Application validation does not replace database integrity.

---

# 22. CONCURRENCY REQUIREMENTS

At minimum, the QA plan should test:

### Scenario A

```text
Stock = 10
A requests 8
B requests 5
```

Expected:

- only a valid aggregate outcome is committed;
- no negative stock;
- no contradictory movement ledger.

### Scenario B

Two users attempt to assign the same asset.

Expected:

- only one valid current assignment exists according to business policy;
- historical records remain consistent;
- competing operation receives a conflict/validation result.

### Scenario C

Two users transfer the same asset simultaneously.

Expected:

- final state is consistent;
- impossible state transitions are rejected.

---

# 23. NON-FUNCTIONAL REQUIREMENTS

# NFR-SEC — Security

## NFR-SEC-001

All sensitive production traffic shall use HTTPS.

## NFR-SEC-002

Authentication shall use secure session management.

## NFR-SEC-003

Authorization shall be enforced server-side.

## NFR-SEC-004

Inputs shall be validated server-side.

## NFR-SEC-005

Secrets shall not be stored in source control.

## NFR-SEC-006

Protected resources shall defend against IDOR/BOLA.

## NFR-SEC-007

File uploads shall be validated.

## NFR-SEC-008

Security-sensitive operations shall be auditable.

## NFR-SEC-009

Error responses shall not expose internal secrets.

## NFR-SEC-010

Dependencies shall receive appropriate security review.

---

# NFR-DATA — Data Integrity

## NFR-DATA-001

Critical mutations shall be transactional.

## NFR-DATA-002

Foreign-key relationships shall remain valid.

## NFR-DATA-003

Historical movement records shall not be silently overwritten.

## NFR-DATA-004

Concurrent operations shall preserve domain invariants.

---

# NFR-PERF — Performance

## NFR-PERF-001

Large tables shall use bounded/paginated data retrieval.

## NFR-PERF-002

Server rendering should be preferred for non-interactive content.

## NFR-PERF-003

Client-side JavaScript shall be minimized.

## NFR-PERF-004

Images shall be optimized where applicable.

## NFR-PERF-005

Database queries shall use appropriate indexes.

Precise numeric SLAs are `[TBD]` because the client has not yet provided load targets.

---

# NFR-UX — Usability

## NFR-UX-001

Core workflows shall be discoverable.

## NFR-UX-002

Forms shall provide actionable validation errors.

## NFR-UX-003

Tables shall support efficient search/filtering where needed.

## NFR-UX-004

Important state changes shall be visible to the user.

## NFR-UX-005

Destructive actions should require appropriate confirmation.

---

# NFR-A11Y — Accessibility

## NFR-A11Y-001

The application shall use semantic HTML.

## NFR-A11Y-002

Core workflows shall be keyboard accessible.

## NFR-A11Y-003

Form controls shall have accessible labels.

## NFR-A11Y-004

Focus states shall be visible.

## NFR-A11Y-005

Errors shall be accessible and understandable.

## NFR-A11Y-006

Color shall not be the only mechanism for communicating status.

---

# NFR-REL — Reliability

## NFR-REL-001

Critical transactions shall fail safely.

## NFR-REL-002

The system shall provide meaningful error handling.

## NFR-REL-003

Production database backups shall exist according to the deployment plan.

## NFR-REL-004

Restore testing shall be considered part of operational readiness.

---

# NFR-OBS — Observability

## NFR-OBS-001

Relevant server operations shall support structured logging.

## NFR-OBS-002

Important requests/events should have correlation identifiers.

## NFR-OBS-003

Security-sensitive events shall be observable without exposing secrets.

---

# NFR-MAINT — Maintainability

## NFR-MAINT-001

The codebase shall use explicit domain boundaries.

## NFR-MAINT-002

TypeScript strictness should be maintained.

## NFR-MAINT-003

Critical business rules shall be testable independently.

## NFR-MAINT-004

Architecture decisions shall be documented.

---

# NFR-TEST — Testability

## NFR-TEST-001

Critical domain rules shall have automated tests.

## NFR-TEST-002

Critical end-to-end workflows shall have E2E coverage.

## NFR-TEST-003

Authorization behavior shall be testable.

## NFR-TEST-004

Regression suites shall be executable in CI where practical.

---

# NFR-COST — FinOps

The system should avoid unnecessary infrastructure.

Optional infrastructure such as Redis, queues, telemetry platforms, and object storage should be introduced only when business or operational needs justify their cost.

---

# 24. TECHNICAL ARCHITECTURE REQUIREMENTS

## TAR-001

Framework:

**Next.js 16.x App Router**

## TAR-002

Runtime:

**Node.js 24 LTS**

## TAR-003

Database:

**MySQL 8.4 LTS**

## TAR-004

ORM:

**Prisma ORM 7.x**

## TAR-005

Authentication:

**Better Auth**

## TAR-006

Validation:

**Zod**

## TAR-007

UI:

**Tailwind CSS v4 + shadcn/ui + Lucide React**

## TAR-008

Tables:

**TanStack Table**

## TAR-009

Charts:

**Recharts**

## TAR-010

Testing:

**Vitest + React Testing Library + Playwright**

## TAR-011

Application architecture:

**Modular Monolith**

## TAR-012

React rendering strategy:

**Server-first**

---

# 25. RECOMMENDED PROJECT STRUCTURE

```text
src/
  app/
    (auth)/
      login/

    (dashboard)/
      dashboard/
      inventory/
      assets/
      maintenance/
      monitoring/
      reports/
      users/
      settings/

    api/

  modules/
    inventory/
      domain/
      application/
      infrastructure/
      schemas/

    assets/
      domain/
      application/
      infrastructure/
      schemas/

    maintenance/
      domain/
      application/
      infrastructure/
      schemas/

    monitoring/
      domain/
      application/
      infrastructure/
      schemas/

    users/
      domain/
      application/
      infrastructure/
      schemas/

    reports/
      domain/
      application/
      infrastructure/
      schemas/

  components/
    ui/
    forms/
    tables/
    charts/
    layout/

  lib/
    auth/
    db/
    validation/
    security/
    logging/
    storage/
    observability/

  types/

prisma/
  schema.prisma
  migrations/

tests/
e2e/
docs/
```

The exact structure may evolve as implementation evidence appears.

---

# 26. INFORMATION ARCHITECTURE

Proposed application navigation:

```text
Dashboard
Inventory
  Items
  Stock
  Movements
Assets
  Asset List
  Assignments
  Transfers
Maintenance
Monitoring
Reports
Users
Settings
```

Visibility must be role-aware.

The exact navigation is `[TBD]`.

---

# 27. PAGE REQUIREMENTS

## Dashboard

Purpose:

- operational overview;
- attention-required conditions;
- summary of current inventory/asset state.

## Inventory

Purpose:

- manage item master;
- view current stock;
- view movement history.

## Assets

Purpose:

- manage individually tracked assets;
- inspect lifecycle;
- assignment;
- transfer.

## Maintenance

Purpose:

- manage repair/service lifecycle.

## Monitoring

Purpose:

- operational monitoring and exception detection.

## Reports

Purpose:

- generate authorized reports/exports.

## Users

Purpose:

- manage system identities and access.

## Settings

Purpose:

- approved system configurations.

---

# 28. DASHBOARD INFORMATION MODEL

Candidate dashboard sections:

```text
KPI Summary
Asset Status
Stock Health
Maintenance
Attention Required
Recent Activity
```

Every metric must have:

- authoritative source;
- calculation definition;
- update behavior;
- authorization scope.

---

# 29. REPORTING DATA GOVERNANCE

Every report must define:

- source data;
- filter;
- date range;
- actor authorization;
- columns;
- aggregation;
- export format;
- timezone behavior;
- historical semantics.

Do not create reports whose calculations are undefined.

---

# 30. AUDIT DATA GOVERNANCE

Audit records should not be treated as ordinary application content.

They require:

- access control;
- retention policy `[TBD]`;
- integrity considerations;
- sensitive-data minimization.

The client must define legal/organizational retention requirements.

---

# 31. BACKUP AND RECOVERY

Production readiness must define:

## RPO

How much data loss is acceptable?

`[TBD]`

## RTO

How long can service recovery take?

`[TBD]`

Backup policy:

`[TBD]`

Restore test cadence:

`[TBD]`

These are operational requirements requiring client/infrastructure confirmation.

---

# 32. ENVIRONMENTS

Recommended:

```text
Development
    ↓
Staging
    ↓
Production
```

Environment-specific credentials must be isolated.

Development must not depend on production credentials.

---

# 33. DEPLOYMENT

Hosting provider:

`[TBD]`

Application runtime:

`[PROPOSED] Node.js-based Next.js runtime.`

Database hosting:

`[TBD]`

Object storage:

`[TBD / OPTIONAL]`

CI/CD:

`[PROPOSED] GitHub Actions.`

---

# 34. TEST STRATEGY

## Unit tests

Test:

- stock calculations;
- state transitions;
- permission logic;
- validation;
- domain rules.

## Integration tests

Test:

- database behavior;
- transactions;
- mutation workflows;
- authorization against persistence.

## Component tests

Test:

- forms;
- status UI;
- important interaction behavior.

## E2E tests

Test:

- login;
- item creation;
- asset creation;
- asset assignment;
- asset transfer;
- maintenance;
- reporting;
- permission boundaries.

## Security tests

Test:

- authentication;
- authorization;
- IDOR/BOLA;
- input validation;
- file upload;
- session handling;
- privilege escalation;
- rate limiting;
- business logic abuse.

---

# 35. CORE E2E SCENARIOS

## E2E-001 Login

```text
Open login
→ enter valid credentials
→ submit
→ authenticated dashboard
```

## E2E-002 Failed login

```text
Invalid credentials
→ reject
→ show safe error
→ no authenticated session
```

## E2E-003 Create inventory item

```text
Authorized user
→ create item
→ validate
→ save
→ list/detail reflects item
```

## E2E-004 Stock movement

```text
Authorized user
→ stock IN
→ verify quantity
→ verify movement history
```

## E2E-005 Invalid stock-out

```text
Available stock < requested OUT
→ reject
→ quantity unchanged
→ error displayed
```

## E2E-006 Assign asset

```text
Select available asset
→ select holder
→ submit
→ current state changes
→ history created
→ audit created
```

## E2E-007 Transfer asset

```text
Select asset
→ new holder/location
→ submit
→ transfer created
→ current state updated
→ audit created
```

## E2E-008 Authorization

```text
Viewer
→ attempts privileged mutation
→ server denies
```

## E2E-009 Audit

```text
Critical mutation
→ audit record exists
```

---

# 36. ACCEPTANCE CRITERIA PRINCIPLES

Every major feature should have acceptance criteria that are:

- specific;
- observable;
- testable;
- role-aware;
- failure-aware.

Bad:

> “Inventory works.”

Good:

> “An authorized inventory administrator can create an inventory item with required fields, and the server rejects missing required fields before persistence.”

---

# 37. REQUIREMENT TRACEABILITY MATRIX

Baseline structure:

| Req ID | Requirement | User Story | Implementation | Test Case | Status |
|---|---|---|---|---|---|
| FR-AUTH-001 | Login | US-AUTH-001 | Auth module | E2E-001 | TBD |
| FR-STOCK-003 | Stock in | US-STOCK-003 | Inventory module | E2E-004 | TBD |
| FR-ASSET-001 | Asset management | US-ASSET-001 | Asset module | E2E-006 | TBD |
| FR-TRANSFER-001 | Transfer | US-ASSET-TRANSFER-001 | Asset module | E2E-007 | TBD |
| FR-AUDIT-001 | Audit trail | US-AUDIT-001 | Audit module | E2E-009 | TBD |
| FR-MONITOR-001 | Monitoring dashboard | US-MONITOR-001 | Monitoring module | TBD | TBD |

Update this matrix as implementation proceeds.

---

# 38. USER STORY BASELINE

## US-AUTH-001

As an authorized user, I want to log in so that I can access the system according to my permissions.

Acceptance criteria:

- valid authentication succeeds;
- invalid authentication fails;
- unauthorized users cannot access protected pages.

## US-INV-001

As an inventory administrator, I want to register inventory items so that inventory data is centrally maintained.

## US-STOCK-001

As an authorized inventory user, I want to record stock movement so that current quantities and history remain accurate.

## US-ASSET-001

As an asset administrator, I want to register individually tracked assets so that assets can be identified and traced.

## US-ASSET-ASSIGN-001

As an authorized user, I want to assign an asset so that responsibility is visible and traceable.

## US-ASSET-TRANSFER-001

As an authorized user, I want to transfer an asset so that location/holder changes remain traceable.

## US-MAINT-001

As an IT staff member, I want to record maintenance so that repair history is preserved.

## US-MONITOR-001

As a manager, I want to see operational inventory/asset conditions so that I can identify exceptions requiring attention.

## US-REPORT-001

As an authorized manager/auditor, I want reports so that I can review operational records.

---

# 39. OPEN REQUIREMENTS

The System Analyst should resolve these before final implementation:

1. What exactly does “monitoring” mean?
2. Is monitoring near-real-time or periodic?
3. Does the system track inventory only, assets only, or both?
4. Which asset categories are included?
5. Which locations must be modeled?
6. Which roles are actually required?
7. Which role can adjust stock?
8. Does stock adjustment require approval?
9. Which operations require approval?
10. What is the deletion/deactivation policy?
11. Is serial number mandatory?
12. Is purchase price required?
13. Is warranty required?
14. Is maintenance cost required?
15. Are photos required?
16. Is QR/barcode required?
17. Is import required?
18. Is export required?
19. Which report formats are required?
20. Is email notification required?
21. Is there an existing legacy system?
22. Is there existing inventory data to migrate?
23. Who owns the data?
24. What is the backup policy?
25. What are RPO/RTO targets?
26. What hosting is provided?
27. What domain/HTTPS infrastructure is provided?
28. What user volume is expected?
29. What inventory/asset volume is expected?
30. What concurrent user volume is expected?
31. What retention policy applies to audit logs?
32. Are there organizational privacy requirements?
33. Are there mandatory security standards?
34. Is endpoint/device telemetry actually part of monitoring?

---

# 40. DATA MIGRATION

If historical data exists:

1. inspect source schema;
2. map source fields;
3. identify duplicates;
4. identify missing required data;
5. define transformation rules;
6. preview migrated data;
7. test on staging;
8. validate counts;
9. validate relations;
10. execute controlled migration;
11. preserve source evidence where required.

Do not delete or overwrite source data as part of exploratory migration.

---

# 41. IMPORT VALIDATION

For CSV/XLSX:

```text
Input
 ↓
Schema validation
 ↓
Type validation
 ↓
Business validation
 ↓
Duplicate detection
 ↓
Preview
 ↓
Confirm
 ↓
Transactional/batched import
```

Error report should identify:

- row;
- field;
- error;
- suggested correction.

---

# 42. SECURITY REQUIREMENT CHECKLIST

Before production:

```text
[ ] Authentication verified
[ ] Authorization verified
[ ] RBAC verified
[ ] IDOR/BOLA tested
[ ] Field tampering tested
[ ] Input validation tested
[ ] File upload tested
[ ] Session behavior reviewed
[ ] Rate limiting reviewed
[ ] Security headers reviewed
[ ] HTTPS verified
[ ] Secrets scanned
[ ] Dependency security reviewed
[ ] Audit trail verified
[ ] Error leakage reviewed
[ ] Database permissions reviewed
```

---

# 43. ACCESSIBILITY CHECKLIST

```text
[ ] Keyboard navigation
[ ] Visible focus
[ ] Semantic headings
[ ] Labels
[ ] Form errors
[ ] Dialog accessibility
[ ] Table semantics
[ ] Status not color-only
[ ] Reduced motion
[ ] Contrast
[ ] Accessible names
[ ] Mobile usability
```

---

# 44. PERFORMANCE CHECKLIST

```text
[ ] Server-first rendering
[ ] Unbounded queries absent
[ ] Pagination
[ ] Relevant indexes
[ ] Optimized images
[ ] Minimal unnecessary hydration
[ ] Reasonable JS payload
[ ] No redundant fetches
[ ] No unnecessary polling
[ ] Dashboard queries measured
```

---

# 45. PRODUCTION READINESS CHECKLIST

## Product

- [ ] SRS approved
- [ ] Scope approved
- [ ] Roles approved
- [ ] Monitoring definition approved
- [ ] Acceptance criteria complete

## Engineering

- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build passes
- [ ] Migrations reviewed

## Security

- [ ] Auth verified
- [ ] Authorization verified
- [ ] Secrets managed
- [ ] Audit verified
- [ ] Security testing performed

## Operations

- [ ] Hosting configured
- [ ] Database backup configured
- [ ] Restore path documented
- [ ] Monitoring/logging configured
- [ ] Incident contact defined

## QA

- [ ] Regression executed
- [ ] E2E executed
- [ ] Negative cases executed
- [ ] UAT completed
- [ ] Known defects documented

---

# 46. UAT

User Acceptance Testing should validate business outcomes, not internal implementation details.

UAT participants:

`[TBD]`

UAT should cover:

- login;
- inventory operations;
- asset operations;
- assignments;
- transfers;
- maintenance;
- monitoring;
- reporting;
- access control;
- critical error paths.

UAT result states:

- PASS;
- PASS WITH ACCEPTED LIMITATIONS;
- FAIL.

---

# 47. CHANGE CONTROL

Requirements may change.

Every material change should record:

- change ID;
- requested by;
- date;
- reason;
- affected requirements;
- impact;
- security impact;
- database impact;
- test impact;
- schedule/cost impact;
- approval;
- resulting implementation.

Never silently alter the SRS to fit existing code.

---

# 48. RELEASE STRATEGY

Recommended:

```text
Feature branch
  ↓
Pull Request
  ↓
CI
  ↓
Code review
  ↓
Staging
  ↓
QA
  ↓
UAT where applicable
  ↓
Production
```

---

# 49. DOCUMENTATION DELIVERABLES

The project should maintain:

```text
/docs
  /requirements
    SRS.md
    user-stories.md
    acceptance-criteria.md
    traceability.md

  /analysis
    use-cases.md
    business-rules.md
    process-flows.md

  /architecture
    architecture.md
    ERD.md
    ADRs/

  /database
    data-dictionary.md
    migration-notes.md

  /testing
    test-plan.md
    test-cases.md
    test-report.md

  /deployment
    deployment.md
    backup-recovery.md

  /uat
    UAT-plan.md
    UAT-results.md
```

---

# 50. FINAL REQUIREMENT PRINCIPLE

The SRS describes the intended product.

Implementation must remain subordinate to verified requirements.

When a detail is unknown:

```text
Identify
→ Mark TBD
→ Continue independent work
→ Resolve before dependent implementation
```

When a technical fact is version-sensitive:

```text
Verify official documentation
→ Record relevant decision
→ Implement
→ Test
```

When a business rule is ambiguous:

```text
Do not invent
→ Escalate through System Analyst/client
→ Keep assumption visible
```

The system should ultimately provide a secure, auditable, maintainable, and testable inventory/asset platform that a three-person team can operate and explain.

---

# APPENDIX A — REQUIREMENT STATUS AT PROJECT START

### Confirmed

- [x] Client requires Next.js
- [x] Client requires MySQL
- [x] Project is inventory-oriented
- [x] Monitoring is required at a high level
- [x] Team roles are System Analyst, QA Tester, Full-stack Developer

### Proposed / to confirm

- [ ] Exact inventory vs asset scope
- [ ] Exact monitoring definition
- [ ] Exact RBAC roles
- [ ] Exact approval rules
- [ ] Exact asset states
- [ ] Exact report formats
- [ ] QR/barcode
- [ ] Import/export
- [ ] Attachment handling
- [ ] Notifications
- [ ] Backup/RPO/RTO
- [ ] Hosting
- [ ] User/data volume targets

---

# APPENDIX B — TECHNICAL BASELINE

```text
Node.js 24 LTS
Next.js 16.x
React 19.x
TypeScript
pnpm

MySQL 8.4 LTS
Prisma 7.x
Better Auth
Zod

Tailwind CSS v4
shadcn/ui
Lucide React
React Hook Form
TanStack Table
Recharts

Vitest
React Testing Library
Playwright

Pino
GitHub
GitHub Actions
Docker
```

---

# APPENDIX C — ARCHITECTURE AT A GLANCE

```text
                         BPTI USERS
                             │
                             ▼
                    ┌─────────────────┐
                    │    Next.js      │
                    │   App Router    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
          Auth/RBAC      Application      UI/UX
              │           Modules            │
              │              │               │
              └──────────────┼───────────────┘
                             ▼
                        Prisma 7
                             │
                             ▼
                        MySQL 8.4
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
     Inventory             Assets           Maintenance
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                         Monitoring
                             │
                             ▼
                          Reports

Cross-cutting:
Security
Audit
Logging
Validation
Testing
Observability
```

---

# APPENDIX D — FIRST IMPLEMENTATION MILESTONE

Before implementing business features, establish:

1. repository structure;
2. Next.js baseline;
3. TypeScript strictness;
4. MySQL development environment;
5. Prisma 7;
6. migration workflow;
7. Better Auth;
8. authorization boundary;
9. Zod validation;
10. test runner;
11. CI;
12. documentation structure.

Then implement one complete vertical slice:

```text
Authentication
  +
One domain entity
  +
One authorized mutation
  +
Audit
  +
Tests
```

Use the vertical slice to validate the architecture before expanding the system.
