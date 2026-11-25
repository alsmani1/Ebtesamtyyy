# EBTESAMTY — AGENTS & ENGINEERING CONVENTIONS

This repository powers **Ebtesamty (ابتسامتي)**, a multi-branch dental clinic website and clinical/administrative management platform in Egypt.

## 1. Non-Negotiable Scope & Product Boundaries

### Included Products & Dashboards (Strictly 10 Areas)
1. **Public Website** (`/`, `/services`, `/services/[slug]`, `/dentists`, `/branches`, `/branches/[code]`, `/about`, `/new-patients`, `/emergency`, `/pricing`, `/education`, `/faqs`, `/contact`, `/policies`)
2. **Online Appointment Booking Experience** (`/book`, `/appointments/request`)
3. **Patient Portal** (`/portal`, `/portal/appointments`, `/portal/intake`, `/portal/billing`, `/portal/feedback`, `/portal/records`)
4. **Receptionist / Front Desk Dashboard** (`/reception`, `/reception/agenda`)
5. **Dentist / Clinical Workspace** (`/dentist`, `/dentist/chart/[patientId]`)
6. **Owner / Executive Management Dashboard** (`/management` — consolidated + branch drill-down + comparison)
7. **Finance / Accountant Dashboard** (`/billing`)
8. **Inventory & Procurement Dashboard** (`/inventory`, `/purchasing`)
9. **Marketing, CRM & Patient Retention Dashboard** (`/crm`)
10. **Super Admin / System Configuration Dashboard** (`/admin`)

### Explicit Exclusions — DO NOT RE-INTRODUCE
- **NO Separate Branch Manager Dashboard**: All executive, consolidated, and branch-specific oversight lives in the **Owner / Executive Management** dashboard (`/management`).
- **NO HR, Employee Management, Attendance, Payroll, or Staff Scheduling Dashboard**: Doctor duties and appointment calendars exist for booking availability, not HR management.
- **NO Standalone Dental Assistant / Clinical Support Dashboard**.
- **NO Dedicated Laboratory, External Services, Supplier Portal, or Equipment Maintenance Standalone Dashboards**: Equipment or supplier records may exist in the database or under Inventory/Procurement, never as separate standalone department dashboards in navigation.

## 2. Brand Design System & Color Palette

Always use the canonical Ebtesamty brand palette:
- **Primary Deep Teal**: `#176C5B` (hover: `#125648`) — primary actions, active navigation, main links, key interactive controls.
- **Secondary Midnight Blue**: `#163447` — strong headings, structural accents, executive surfaces.
- **Background Warm Ivory**: `#F7F8F5` — main page background and calm surface areas.
- **Highlight Soft Mint**: `#E3F0EB` — secondary cards, subtle highlights, selected states.
- **Surface White**: `#FFFFFF` — cards, tables, forms, modals.
- **Decorative Accent Muted Terracotta**: `#D58B57` — decorative badges/accents only (never small text on white).
- **Semantic Status Colors**: Always pair status colors (`verified`/`success`, `action`/`info`, `warning`/`pending`, `critical`/`error`, `proposed`, `neutral`) with readable text labels and icons to meet WCAG 2.2 AA contrast (minimum 4.5:1).

## 3. Operating Assumptions & Localization
- **Branches**: 3 branches in Egypt (`BR-A` Heliopolis, `BR-B` New Cairo, `BR-C` Maadi).
- **Working Model**: Branch A has 2 dentists + 1 receptionist; Branch B has 2 dentists + 1 receptionist; Branch C has 1 dentist + 1 receptionist.
- **Currency**: Egyptian Pounds (`EGP`), stored in integer minor units (`Piasters` = EGP × 100) in PostgreSQL to prevent floating-point rounding errors. Use `tabular-nums` on all financial tables and KPIs.
- **Time Zone**: `Africa/Cairo`.
- **Bilingual Support**: English (`en`, LTR) and Arabic (`ar`, RTL) via `LanguageContext` and `src/lib/i18n.ts`.

## 4. Data Integrity, Multi-Branch & Security Rules
- **Separate Lifecycles**: Never collapse Booking State (`AppointmentRequestStatus` / `AppointmentStatus`), Visit State (`QueueStatus` / `EncounterStatus`), Payment State (`InvoiceStatus` / `PaymentStatus`), and Treatment Plan State (`TreatmentPlanStatus` / `TreatmentItemStatus`) into a single status column.
- **Shared Patient Identity (EMPI)**: Phone numbers are non-unique across `Patient` records (supporting Egyptian household shared phones). Prevent silent auto-merging on public booking or self-registration; flag potential duplicates via `PotentialDuplicateReview`.
- **Immutable Clinical Records**: Finalized clinical encounters (`EncounterStatus.FINALIZED`) and submitted medical history versions (`MedicalHistorySubmission`) cannot be overwritten; amendments require signed `ClinicalNoteAddendum` records.
- **Idempotent Financials**: Payments require an `idempotencyKey` and atomic transaction allocation.
- **Traceable Inventory Transfers**: Branch-to-branch transfers must transition through `REQUESTED -> SHIPPED -> RECEIVED` with paired `TRANSFER_OUT` and `TRANSFER_IN` stock movements.
- **Server-Side RBAC & Zero-PHI Audit Logs**: Enforce role and branch permissions on every API route and service call (`src/lib/rbac.ts`), and log privileged actions via `logAuditEvent` without leaking free-text clinical notes into audit metadata.
