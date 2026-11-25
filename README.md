# Ebtesamty (ابتسامتي) — Multi-Branch Dental Clinic Website & Management Platform (Egypt)

Ebtesamty is a comprehensive, bilingual (`EN` LTR / `AR` RTL) multi-branch dental clinic public website, online appointment booking system, patient portal, and role-based clinical/administrative management platform engineered for **Egypt (`EGP` / `Africa/Cairo`)**.

---

## 1. Agreed Product & Dashboard Scope (10 Core Areas)

1. **Public-Facing Website**:
   - Homepage (`/`), Services Directory & Clinical Detail Pages (`/services`, `/services/[slug]`), Dentist Directory (`/dentists`), Branch Directory & Dedicated Branch Pages (`/branches`, `/branches/[code]`), About Us (`/about`), New Patient Guide (`/new-patients`), Emergency Dental Information (`/emergency`), Pricing & Payments (`/pricing`), Patient Education (`/education`), FAQs (`/faqs`), Contact Us (`/contact`), and Privacy/Terms/Accessibility Policies (`/policies`).
2. **8-Step Online Appointment Booking Experience** (`/book`, `/appointments/request`, and quick modal):
   - Branch selection $\rightarrow$ Visit reason/service $\rightarrow$ Dentist selection $\rightarrow$ Live slot availability (`/api/scheduling/availability`) $\rightarrow$ Patient details $\rightarrow$ Review & policy $\rightarrow$ PostgreSQL persistence $\rightarrow$ Confirmation with `.ics` calendar export.
3. **Patient Portal** (`/portal`, `/portal/appointments`, `/portal/intake`, `/portal/billing`, `/portal/feedback`):
   - Upcoming/past visits, versioned medical intake & consent, treatment plans, invoices/receipts, Sandbox Online Payment, and feedback submission.
4. **Receptionist / Front Desk Dashboard** (`/reception`, `/reception/agenda`):
   - Daily arrivals & waiting room queue, online booking confirmation, walk-in registration, duplicate candidate review, portal link verification, and checkout.
5. **Dentist / Clinical Workspace** (`/dentist`, `/dentist/chart/[patientId]`):
   - Assigned patient roster, medical alert banner, interactive 32-tooth FDI Odontogram, SOAP clinical encounters, multi-phase treatment plans, prescriptions, and follow-up recall creation.
6. **Owner / Executive Management Dashboard** (`/management`):
   - Consolidated multi-branch overview + branch-level drill-down (`All Branches`, `BR-A`, `BR-B`, `BR-C`), side-by-side branch comparison, separated financial totals (Invoiced vs. Collected vs. Receivables vs. Expenses), and Executive Alert Center. *(Branch management is consolidated here; there is no separate Branch Manager dashboard).*
7. **Finance / Accountant Dashboard** (`/billing`):
   - Invoices, multi-method EGP payment recording (`CASH`, `CARD`, `INSTAPAY`, `FAWRY`, `BANK_TRANSFER`), installment plans, cash drawer reconciliation, refunds, and operating expenses.
8. **Inventory & Procurement Dashboard** (`/inventory`, `/purchasing`):
   - Dental consumables catalog, branch stock ledgers, low-stock and expiry alerts, inter-branch transfers, suppliers, and purchase orders.
9. **Marketing, CRM & Patient Retention Dashboard** (`/crm`):
   - Website/phone inquiry pipeline, conversion funnel analytics with explicit denominators, dentist-recommended patient recall queue, and privacy-safe communication templates.
10. **Super Admin / System Configuration Dashboard** (`/admin`):
    - Immutable audit trail explorer, user accounts & RBAC role grants, branch & doctor configuration, service catalog pricing, and integration status.

> **Explicit Scope Discipline**: The platform intentionally excludes any separate Branch Manager dashboard, HR/Payroll/Attendance module, standalone Dental Assistant dashboard, or standalone Lab/Supplier/Equipment department navigation.

---

## 2. Multi-Branch Staffing Model & Demo Credentials

All seeded demo accounts use password: **`Password123!`** (or use the instant one-click switcher at **`/demo`**).

| Branch | Dentists (2 + 2 + 1) | Receptionist (1 + 1 + 1) |
| :--- | :--- | :--- |
| **Branch A — Heliopolis (`BR-A`)** | `dr.sandy@ebtesamty.dev` (Dr. Sandy Saad)<br>`dr.feby@ebtesamty.dev` (Dr. Feby Samer) | `mariam.reception@ebtesamty.dev` (Mariam Hanna) |
| **Branch B — New Cairo (`BR-B`)** | `dr.ahmed@ebtesamty.dev` (Dr. Ahmed Hassan)<br>`dr.youssef@ebtesamty.dev` (Dr. Youssef El-Mansy) | `sandy.reception@ebtesamty.dev` (Sandy Abd) |
| **Branch C — Maadi (`BR-C`)** | `dr.nadia@ebtesamty.dev` (Dr. Nadia El-Hariry) | `salma.reception@ebtesamty.dev` (Salma El-Masry) |

- **Owner / Executive / Finance / Inventory / CRM / Super Admin**: `admin@ebtesamty.dev`
- **Portal Patients**: `hassan.patient@ebtesamty.dev`, `nour.patient@ebtesamty.dev`, `layla.patient@ebtesamty.dev`

---

## 3. Architecture & Documentation (`docs/`)

- [`AGENTS.md`](file:///c:/Ebtesamty/AGENTS.md) — Engineering governance, scope boundaries, and safety invariants
- [`docs/PRODUCT_REQUIREMENTS.md`](file:///c:/Ebtesamty/docs/PRODUCT_REQUIREMENTS.md) — Product requirements & branch operating model
- [`docs/DESIGN_SYSTEM.md`](file:///c:/Ebtesamty/docs/DESIGN_SYSTEM.md) — Brand color palette (`#176C5B`, `#163447`, `#F7F8F5`, `#E3F0EB`, `#D58B57`), typography, and RTL/LTR rules
- [`docs/DATA_MODEL.md`](file:///c:/Ebtesamty/docs/DATA_MODEL.md) — PostgreSQL & Prisma schema reference
- [`docs/ROLES_AND_PERMISSIONS.md`](file:///c:/Ebtesamty/docs/ROLES_AND_PERMISSIONS.md) — RBAC permission matrix & clinical privacy rules
- [`docs/INTEGRATIONS_AND_CONFIGURATION.md`](file:///c:/Ebtesamty/docs/INTEGRATIONS_AND_CONFIGURATION.md) — Live, Configurable, and Sandbox adapters
- [`docs/WORKFLOWS_AND_ACCEPTANCE_TESTS.md`](file:///c:/Ebtesamty/docs/WORKFLOWS_AND_ACCEPTANCE_TESTS.md) — End-to-end workflows & acceptance tests
- [`docs/IMPLEMENTATION_PLAN.md`](file:///c:/Ebtesamty/docs/IMPLEMENTATION_PLAN.md) — Phased architecture & verification plan

---

## 4. Local Setup & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema & seed authoritative Egyptian multi-branch dataset
npx prisma db push
npm run db:seed

# 3. Run TypeScript check, Vitest integration tests, and production build
npm run typecheck
npm test
npm run build

# 4. Start development server on http://localhost:3000
npm run dev

# 5. Run Playwright E2E browser tests
npx playwright test
```
