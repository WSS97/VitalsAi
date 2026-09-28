ALTER TABLE biomarker_readings
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE biomarker_readings
  ALTER COLUMN owner_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_biomarker_readings_owner_created_at
  ON biomarker_readings (owner_id, created_at DESC);

DROP POLICY IF EXISTS "anon_select_readings" ON biomarker_readings;
DROP POLICY IF EXISTS "anon_insert_readings" ON biomarker_readings;
DROP POLICY IF EXISTS "anon_update_readings" ON biomarker_readings;
DROP POLICY IF EXISTS "anon_delete_readings" ON biomarker_readings;

DROP POLICY IF EXISTS "readings_select_own" ON biomarker_readings;
DROP POLICY IF EXISTS "readings_insert_own" ON biomarker_readings;
DROP POLICY IF EXISTS "readings_update_own" ON biomarker_readings;
DROP POLICY IF EXISTS "readings_delete_own" ON biomarker_readings;

CREATE POLICY "readings_select_own" ON biomarker_readings FOR SELECT
  TO authenticated USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "readings_insert_own" ON biomarker_readings FOR INSERT
  TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "readings_update_own" ON biomarker_readings FOR UPDATE
  TO authenticated USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "readings_delete_own" ON biomarker_readings FOR DELETE
  TO authenticated USING (owner_id = (SELECT auth.uid()));