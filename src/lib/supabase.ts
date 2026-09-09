import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Atenção: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY estão ausentes!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

console.log('URL do Supabase:', import.meta.env.VITE_SUPABASE_URL);
console.log('Chave Anon do Supabase:', import.meta.env.VITE_SUPABASE_ANON_KEY)

export type BiomarkerInput = Omit<BiomarkerReading, 'id' | 'created_at'>;
