PRAGMA foreign_keys = ON;

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY CHECK(length(token_hash) = 64),
  user_id TEXT NOT NULL,
  clinic_id TEXT NOT NULL,
  account_fingerprint TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK(expires_at > created_at)
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE INDEX sessions_user ON sessions(user_id, created_at DESC);

CREATE TABLE rate_limits (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL CHECK(hits > 0),
  expires_at INTEGER NOT NULL,
  PRIMARY KEY(bucket_key, window_start)
);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);

CREATE TABLE clinic_state (
  clinic_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0,
  lock_token TEXT,
  lock_expires_at INTEGER NOT NULL DEFAULT 0
);
-- The first statement of an atomic sync batch must prove its authorization
-- lease is still owned. CHECK failure rolls back the entire batch.
CREATE TABLE sync_assertions (
  token TEXT PRIMARY KEY,
  valid INTEGER NOT NULL CHECK(valid = 1)
);

CREATE TABLE records (
  clinic_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('patients','appointments','invoices',
    'ledgerInvoices','ledgerPayments','expenses','labOrders')),
  id TEXT NOT NULL,
  branch_code TEXT NOT NULL CHECK(branch_code IN ('BR-A','BR-B','BR-C')),
  patient_id TEXT,
  doctor_name TEXT,
  assignment_authority TEXT CHECK(assignment_authority IS NULL OR
    assignment_authority IN ('clinic_owner','receptionist')),
  data TEXT NOT NULL CHECK(json_valid(data) AND length(data) <= 16384),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(clinic_id, kind, id)
);
CREATE INDEX records_branch ON records(clinic_id, kind, branch_code, id);
CREATE INDEX records_patient ON records(clinic_id, kind, patient_id, branch_code);
CREATE INDEX records_patient_scope ON records(clinic_id, patient_id, branch_code);
CREATE INDEX records_care ON records(clinic_id, kind, doctor_name, branch_code, patient_id);
CREATE INDEX records_updated ON records(clinic_id, kind, updated_at DESC, id);

-- Shared current invoices override cumulative amounts, never payment dates.
-- Sync enforces identical branch/patient scopes across the two invoice stores.
CREATE VIEW effective_invoices AS
SELECT l.clinic_id, l.id, l.branch_code, l.patient_id,
  COALESCE(c.data, l.data) AS data,
  COALESCE(json_extract(c.data, '$.patientNameEn'), json_extract(l.data, '$.patientNameEn')) AS patient_name,
  COALESCE(json_extract(c.data, '$.date'), json_extract(l.data, '$.date')) AS invoice_date,
  CAST(ROUND(COALESCE(json_extract(c.data, '$.totalAmount'), json_extract(l.data, '$.total')) * 100) AS INTEGER) AS total_cents,
  CAST(ROUND(COALESCE(json_extract(c.data, '$.paidAmount'), json_extract(l.data, '$.paid')) * 100) AS INTEGER) AS paid_cents
FROM records l LEFT JOIN records c ON c.clinic_id = l.clinic_id
  AND c.kind = 'invoices' AND c.id = l.id
WHERE l.kind = 'ledgerInvoices'
UNION ALL
SELECT c.clinic_id, c.id, c.branch_code, c.patient_id, c.data,
  json_extract(c.data, '$.patientNameEn'), json_extract(c.data, '$.date'),
  CAST(ROUND(json_extract(c.data, '$.totalAmount') * 100) AS INTEGER),
  CAST(ROUND(json_extract(c.data, '$.paidAmount') * 100) AS INTEGER)
FROM records c WHERE c.kind = 'invoices' AND NOT EXISTS (
  SELECT 1 FROM records l WHERE l.clinic_id = c.clinic_id
    AND l.kind = 'ledgerInvoices' AND l.id = c.id
);

CREATE VIEW current_invoices AS
SELECT clinic_id, id, branch_code, patient_id, data,
  json_extract(data, '$.patientNameEn') AS patient_name,
  json_extract(data, '$.date') AS invoice_date,
  CAST(ROUND(json_extract(data, '$.totalAmount') * 100) AS INTEGER) AS total_cents,
  CAST(ROUND(json_extract(data, '$.paidAmount') * 100) AS INTEGER) AS paid_cents
FROM records WHERE kind = 'invoices';

CREATE VIEW recorded_payments AS
SELECT clinic_id, id, json_extract(data, '$.invoiceId') AS invoice_id,
  json_extract(data, '$.date') AS payment_date,
  CAST(ROUND(json_extract(data, '$.amount') * 100) AS INTEGER) AS amount_cents,
  json_extract(data, '$.method') AS method
FROM records WHERE kind = 'ledgerPayments';

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL REFERENCES sessions(token_hash) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  clinic_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  context_digest TEXT NOT NULL DEFAULT '',
  next_turn INTEGER NOT NULL DEFAULT 0,
  lock_token TEXT,
  lock_expires_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX conversations_session ON conversations(session_hash, expires_at DESC);
CREATE INDEX conversations_expiry ON conversations(expires_at);
CREATE TABLE conversation_turns (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  query TEXT NOT NULL CHECK(length(query) <= 2000),
  answer TEXT NOT NULL CHECK(length(answer) <= 6500),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(conversation_id, turn_number)
);
