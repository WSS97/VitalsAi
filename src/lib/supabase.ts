import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou Anon Key estão ausentes!');
}

export const supabase = createClient(supabaseUrl || '',
  supabaseAnonKey || '',
  {
    global: {
      headers: {
        // Força a inclusão da chave de API em todas as chamadas HTTP
        apikey: supabaseAnonKey || '',
      },
    },
  }
);

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
