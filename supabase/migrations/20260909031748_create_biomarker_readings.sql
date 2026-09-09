/*
# Create biomarker_readings table (single-tenant, no auth)

1. New Tables
- `biomarker_readings`
  - `id` (uuid, primary key)
  - `glucose` (numeric, mg/dL) — fasting blood glucose
  - `systolic` (integer, mmHg) — systolic blood pressure
  - `diastolic` (integer, mmHg) — diastolic blood pressure
  - `total_cholesterol` (numeric, mg/dL)
  - `hdl` (numeric, mg/dL) — HDL cholesterol
  - `ldl` (numeric, mg/dL) — LDL cholesterol
  - `triglycerides` (numeric, mg/dL)
  - `notes` (text, optional user notes)
  - `created_at` (timestamptz, defaults to now)
2. Security
- Enable RLS on `biomarker_readings`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).
3. Indexes
- Index on `created_at` descending for efficient history queries.
*/

CREATE TABLE IF NOT EXISTS biomarker_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  glucose numeric CHECK (glucose IS NULL OR (glucose > 0 AND glucose < 1000)),
  systolic integer CHECK (systolic IS NULL OR (systolic > 0 AND systolic < 400)),
  diastolic integer CHECK (diastolic IS NULL OR (diastolic > 0 AND diastolic < 300)),
  total_cholesterol numeric CHECK (total_cholesterol IS NULL OR (total_cholesterol > 0 AND total_cholesterol < 1000)),
  hdl numeric CHECK (hdl IS NULL OR (hdl > 0 AND hdl < 500)),
  ldl numeric CHECK (ldl IS NULL OR (ldl > 0 AND ldl < 1000)),
  triglycerides numeric CHECK (triglycerides IS NULL OR (triglycerides > 0 AND triglycerides < 5000)),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE biomarker_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_readings" ON biomarker_readings;
CREATE POLICY "anon_select_readings" ON biomarker_readings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_readings" ON biomarker_readings;
CREATE POLICY "anon_insert_readings" ON biomarker_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_readings" ON biomarker_readings;
CREATE POLICY "anon_update_readings" ON biomarker_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_readings" ON biomarker_readings;
CREATE POLICY "anon_delete_readings" ON biomarker_readings FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_biomarker_readings_created_at
  ON biomarker_readings (created_at DESC);
