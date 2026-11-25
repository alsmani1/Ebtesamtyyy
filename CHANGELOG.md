# Changelog

All notable changes to the Ebtesamty Dental Clinic Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2026-10-17

### Checkpoint D: Billing, Invoicing, Cashier Payments, Installments & Expenses (DFD 6, 14)

#### Added
- **Authoritative Service Catalog:**
  - Standard dental service catalog (`ServiceCatalogItem`) seeded with base prices in integer minor units (Piasters / EGP).
- **Invoices & Treatment Charges:**
  - Invoice generation (`Invoice`, `InvoiceLine`) with multi-line items, automatic quantity and subtotal calculations, and sequential numbering (`INV-YYYY-XXXX`).
  - Strict lifecycle status progression: `DRAFT` -> `ISSUED` -> `PARTIALLY_PAID` -> `PAID`.
- **Atomic & Idempotent Payments (DFD 6):**
  - Cashier receipt posting (`Payment`, `PaymentAllocation`) supporting `CASH`, `CREDIT_CARD`, `INSTAPAY`, and `FAWRY` payment methods.
  - Idempotency key protection preventing duplicate transactions or double-crediting.
  - Automatic invoice balance updates within an atomic database transaction.
- **Installment Financing Plans:**
  - Multi-month flexible installment plans (`InstallmentPlan`, `Installment`) with equal monthly splits and exact remainder absorption.
- **Daily Cash Drawer Reconciliation (DFD 14):**
  - Shift-end drawer count verification (`CashReconciliation`) comparing physical counted currency against authoritative system expected cash collections for the branch day.
  - Discrepancy (shortage / overage) tracking with audit notes.
- **Branch Operating Expense Register:**
  - Expense tracking (`Expense`) across `SUPPLIES`, `MAINTENANCE`, `UTILITIES`, `RENT`, and `LAB_FEES`.
- **Separate Financial Metrics:**
  - Clear architectural separation between **Invoiced Charges**, **Collected Cash / Digital**, and **Operating Expenses** without asserting fabricated "net profit" figures.
- **Workspaces & Views:**
  - Staff Billing & Cashier Desk (`/billing`) with invoices table, payment modal, drawer count reconciliation, and expense register.
  - Patient Portal Billing View (`/portal/billing`) with patient statements and payment history.
- **Verification:**
  - Vitest integration suite (`tests/integration/fn01_fn12_billing_and_finance.test.ts`): 8/8 tests passing (FN01-FN08).
  - Playwright E2E suite updated with `T14.5` verifying receptionist navigation to billing desk and separated financial metrics.
  - Total tests: 37 Vitest integration tests passing, 7 Playwright E2E tests passing, 49/49 Next.js routes compiling.

---

## [0.3.0] - 2026-10-17

### Checkpoint C: Clinical Records, Odontogram (Tooth Chart), Encounters & Treatments (DFD 3, 4, 5)

#### Added
- **Interactive Dental Odontogram (Tooth Chart):**
  - Full 32-tooth adult maxillary and mandibular arches following ISO 3950 / FDI two-digit clinical notation (`src/components/clinical/ToothChart.tsx`).
  - Standard clinical condition color-coding (`CARIES`, `RESTORED`, `ROOT_CANAL_TREATED`, `MISSING`, `FRACTURED`, `HEALTHY`).
  - Tooth inspector drawer with historical findings chronology and real-time surface/condition recording.
- **Clinical Encounters & Immutable Notes:**
  - Encounter drafting (`src/services/clinical.service.ts`) with chief complaint, examination findings, and provisional diagnosis.
  - Finalization workflow (`finalizeEncounter`) creating legally immutable clinical records with lock status.
  - Signed clinical addenda (`ClinicalNoteAddendum`) allowing append-only amendments with clinician signature and timestamp without altering historical text.
- **Staged Multi-Session Treatment Planning (DFD 4):**
  - Treatment plan management with title, notes, and staged procedure items.
  - Automatic minor units cost aggregation in Piasters (EGP).
  - Procedural item performance tracking linked to specific encounter IDs (`markTreatmentItemPerformed`).
  - Treatment plan status progression: `DRAFT` -> `PROPOSED` -> `ACCEPTED` -> `COMPLETED`.
- **Diagnostic Files, X-Rays & Consent Artifacts (DFD 5):**
  - Protected document metadata recording (`DocumentMetadata`) with MIME validation and 50MB healthcare threshold.
  - Categorization for Panoramic OPG, Periapical PA, Intraoral Photos, Lab Reports, and Signed Consents.
- **Dentist Patient Chart (EDR):**
  - Full clinician Electronic Dental Record page (`/dentist/chart/[patientId]`) with real-time summary, medical alerts banner, and tabbed workflow.
  - Quick-action link from dentist workspace roster.
- **Verification:**
  - Vitest integration suite (`tests/integration/cl01_cl10_clinical_records.test.ts`): 8/8 tests passing (CL01-CL08).
  - Playwright E2E suite updated with `T14.3B` verifying clinician navigation to dental chart and odontogram inspection.
  - All 29 Vitest tests and all 6 Playwright tests passing with 40/40 routes compiled.

---

## [0.2.0] - 2026-10-17

### Checkpoint B: Appointments, Scheduling, Arrivals & Reception Queue (DFD 2, 7)

#### Added
- **Doctor Duties & Capacity Feasibility:**
  - Shift management (`DoctorDuty`) with substitution support and room feasibility checks (`src/services/scheduling.service.ts`).
  - Absence reporting with automatic `CoverageException` generation and `OperationalAlert` creation.
- **Appointment Request Lifecycle:**
  - Patient online appointment request flow (`AppointmentRequest`) with preferred time windows and reason (`/portal/appointments`).
  - Reception review modal (`/reception/agenda`) with `CONFIRM` (atomic slot locking and overlap rejection), `PROPOSE_ALTERNATIVE`, or `DECLINE`.
  - Patient alternative acceptance/declination with status updates.
- **Arrival Events & Queue Management:**
  - Patient self-service arrival announcement (`/portal/check-in`) creating unverified `ArrivalEvent`.
  - Reception physical identity and presence verification workflow admitting patient into waiting queue with sequential queue numbers.
  - Direct walk-in queue admission with duplicate avoidance.
  - Consultation queue transitions: `CALL` -> `START` -> `COMPLETE`.
- **Verification:**
  - Vitest integration suite (`tests/integration/sc01_sc15_scheduling_and_queues.test.ts`): 8/8 tests passing (SC01-SC15).

---

## [0.1.0] - 2026-10-17

### Phase 01: Production-Intended Foundation, Patient Identity, Medical Intake, and Clinician Review

#### Added
- **Native PostgreSQL Relational Architecture:**
  - Fully version-controlled Prisma migration (`20261016232217_init_phase01_foundation`).
  - Production-identical PostgreSQL database across dev, test, and staging environments.
  - Comprehensive seed script (`prisma/seed.ts`) populating Branches A (Heliopolis), B (New Cairo), and C (Zamalek), 7 staff users across roles, 3 portal users, and 7 realistic fictional clinical patients with varied provenance and migration statuses.
- **Strict Role-Based Access Control (RBAC) & Session Isolation:**
  - Database-backed sessions with HTTP-only cookies and cryptographic token hashing (`src/lib/auth.ts`).
  - Role hierarchy enforcement: `PATIENT`, `RECEPTIONIST`, `DENTIST`, `BRANCH_MANAGER`, `SYSTEM_ADMIN` (`src/lib/rbac.ts`).
  - Strict multi-branch authorization: receptionist cannot access clinical dentist queues (HTTP 403 verified).
  - Explicit patient session isolation: portal users can only access their own linked patient files.
  - Sanitized operational audit logger (`src/lib/audit.ts`) capturing actor ID, timestamp, and action while strictly preventing raw clinical PHI leakage.
- **Patient Identity & Master Index (EMPI):**
  - Walk-in patient registration without requiring an email address (`src/services/patient.service.ts`).
  - Standardized public file number generation: `EBT-PAT-YYYY-XXXX`.
  - Non-unique phone index allowing multiple family members to share a household telephone without data collision.
  - Zero-trust portal registration: online self-registration creates isolated identity; cannot hijack existing clinic records.
  - Staff-supervised `PortalPatientLink` verification workflow with National ID physical check.
  - Potential duplicate candidate detection (`SAME_PHONE`, `EXACT_NATIONAL_ID`) with staff resolution queue (no dangerous auto-merges).
  - Legacy electronic health record migration flags (`LEGACY_MIGRATION`, `legacySystemId`, `legacyNotes`).
- **Multi-Step Medical Intake & Clinician Review:**
  - 5-step structured clinical intake questionnaire: Systemic Diseases, Bleeding/Allergies, Current Medications, Dental Symptoms, and Lifestyle Habits.
  - Tri-state answering schema (`YES`, `NO`, `UNKNOWN`) with required explanatory notes for affirmative flags.
  - Real-time draft persistence (`MedicalIntakeDraft`) allowing patients and receptionists to save progress across steps.
  - Monotonically versioned immutable submissions (`MedicalHistoryVersion`) preventing in-place alteration of signed clinical disclosures.
  - Reception-assisted kiosk attribution (`assistedStaffId`) for digital assistance at front desk.
  - Dentist review desk (`/dentist`) with pending sign-off queue, clinical history inspector, contraindication action flags, and 1-click clearance.
  - Version currentness invalidation: updating an intake automatically flags the patient as `PENDING_REVIEW` while preserving prior reviewed versions.
- **Management Workspace (Zero PHI):**
  - Multi-branch operational metrics dashboard (`/management`) displaying patient intake status distribution, draft counts, pending reviews, and duplicate reviews.
  - Exception queue and operational audit trail with strictly zero clinical PHI.
- **User Interface & Accessibility:**
  - Accessible healthcare design system built with Next.js 14 App Router and Tailwind CSS.
  - Complete English / Arabic bilingual support with genuine bidirectional layout (`dir="rtl"` / `dir="ltr"`).
  - Responsive mobile operatory viewport support.
  - Role switcher demo panel (`/demo`) for rapid testing across all five personas.
  - Informational Phase 02 booking notice modal on clinic landing page.
- **Automated Test Suite (100% Executed & Passing):**
  - Vitest integration test suite (T01–T13) covering database integrity, cross-patient isolation, walk-in creation, phone sharing, anti-hijacking, portal linking, draft saving, intake versioning, receptionist assistance, dentist review sign-off, version invalidation, and zero-PHI management metrics.
  - Playwright end-to-end test suite (T14.1–T14.4, T15) covering real browser journeys for Patient, Receptionist, Dentist, 403 Forbidden enforcement, and Mobile/RTL responsiveness.

---

## [Unreleased Roadmap]

### Phase 02: Appointment Scheduling & Operatory Management (Planned)
- Multi-chair clinic schedule calendar across Branches A, B, and C.
- Operatory room and dental chair assignment.
- Appointment status lifecycle: Booked -> Confirmed -> Arrived -> In Chair -> Completed -> No Show.
- Phase 02 online booking engine replacing Phase 01 notice modal.

### Phase 03: Clinical Charting & Odontogram (Planned)
- Interactive FDI two-digit notation dental odontogram.
- Periodontal pocket depth recording and tooth condition tracking.
- Treatment plan formulation with staged clinical procedures.

### Phase 04: Billing, Invoicing & Financial Operations (Planned)
- Fee schedules and itemized procedure invoices.
- Multi-tender payment processing (Cash, Egyptian Debit/Credit Cards, Fawry, InstaPay).
- Syndicate copayments and private dental insurance claims.

### Phase 05: Inventory & Supply Chain Management (Planned)
- Central dental supplies catalog (composites, anesthetics, implants, consumables).
- Branch inventory tracking and low-stock threshold alerts.
- Stock transfer requests between Heliopolis, New Cairo, and Zamalek branches.

### Phase 06: Automated Communications & Patient Engagement (Planned)
- SMS and WhatsApp appointment reminders via Egyptian gateway.
- Post-operative care instruction broadcasts.
- Automated patient satisfaction surveys and Google Reviews integration.
