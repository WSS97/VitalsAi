import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  },
});

export interface BiomarkerReading {
  id: string;
  glucose: number | null;
  systolic: number | null;
  diastolic: number | null;
  total_cholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;
  notes: string;
  created_at: string;
}

export type BiomarkerInput = Omit<BiomarkerReading, 'id' | 'created_at'>;