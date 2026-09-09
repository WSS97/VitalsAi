import type { BiomarkerReading } from './supabase';

export interface GroqAnalysisResult {
  overallScore: number;
  riskLevel: string;
  analysis: string[];
  recommendations: string[];
  nextSteps: string[];
  insights: string[];
  summary: string;
  warning: string;
}

export async function fetchGroqAnalysis(
  current: BiomarkerReading,
  previous?: BiomarkerReading | null,
): Promise<GroqAnalysisResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const functionUrl = `${supabaseUrl}/functions/v1/analyze-biomarkers`;

  const body = {
    current: {
      glucose: current.glucose,
      systolic: current.systolic,
      diastolic: current.diastolic,
      total_cholesterol: current.total_cholesterol,
      hdl: current.hdl,
      ldl: current.ldl,
      triglycerides: current.triglycerides,
      notes: current.notes,
    },
    previous: previous
      ? {
          glucose: previous.glucose,
          systolic: previous.systolic,
          diastolic: previous.diastolic,
          total_cholesterol: previous.total_cholesterol,
          hdl: previous.hdl,
          ldl: previous.ldl,
          triglycerides: previous.triglycerides,
          notes: previous.notes,
          created_at: previous.created_at,
        }
      : null,
  };

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Falha na análise da IA (${response.status})`);
  }

  const data = await response.json();

  if (!data || typeof data.overallScore !== 'number') {
    throw new Error('Resposta inválida da IA.');
  }

  return {
    overallScore: data.overallScore,
    riskLevel: data.riskLevel || 'Risco Moderado',
    analysis: Array.isArray(data.analysis) ? data.analysis : [],
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    insights: Array.isArray(data.insights) ? data.insights : [],
    summary: data.summary || '',
    warning: data.warning || '',
  };
}
