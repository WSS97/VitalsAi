import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, HeartPulse } from 'lucide-react';
import { supabase, type BiomarkerReading, type BiomarkerInput } from './lib/supabase';
import { analyzeReading, type AnalysisResult } from '@/lib/analysis';
import { fetchGroqAnalysis } from '@/lib/groq';
import { BiomarkerForm } from '@/components/BiomarkerForm';
import { AIReport } from '@/components/AIReport';
import { StatCards } from '@/components/StatCards';
import { ReadingHistory } from '@/components/ReadingHistory';
import { TrendChart } from '@/components/TrendChart';

function App() {
  const [readings, setReadings] = useState<BiomarkerReading[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrend, setActiveTrend] = useState<'glucose' | 'systolic' | 'total_cholesterol'>('glucose');

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('biomarker_readings')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Não foi possível carregar suas leituras. Tente novamente.');
    } else if (data) {
      setReadings(data as BiomarkerReading[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const createLocalAnalysis = (reading: BiomarkerReading, previous?: BiomarkerReading) => {
    return analyzeReading(reading, previous);
  };

  const handleSubmit = async (input: BiomarkerInput) => {
    setAnalyzing(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('biomarker_readings')
      .insert(input)
      .select()
      .maybeSingle();

    if (insertError || !data) {
      setError('Não foi possível salvar sua leitura. Tente novamente.');
      setAnalyzing(false);
      return;
    }

    const newReading = data as BiomarkerReading;
    const previous = readings.length > 0 ? readings[0] : undefined;
    setReadings((prev) => [newReading, ...prev]);

    try {
      const aiResult = await fetchGroqAnalysis(newReading, previous);
      const localResult = createLocalAnalysis(newReading, previous);
      setAnalysis({
        ...localResult,
        overallScore: Math.max(0, Math.min(100, Math.round(aiResult.overallScore))),
        riskLevel: aiResult.riskLevel,
        analysis: aiResult.analysis,
        recommendations: aiResult.recommendations,
        nextSteps: aiResult.nextSteps,
        insights: aiResult.insights,
        summary: aiResult.summary,
        warning: aiResult.warning,
      });
    } catch {
      setAnalysis(createLocalAnalysis(newReading, previous));
      setError('A análise por IA não está disponível no momento. Exibindo uma análise clínica local.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await supabase.from('biomarker_readings').delete().eq('id', id);
    if (deleteError) {
      setError('Não foi possível excluir a leitura.');
      return;
    }
    setReadings((prev) => prev.filter((r) => r.id !== id));
    setAnalysis(null);
  };

  const handleSelect = async (reading: BiomarkerReading) => {
    const previous = readings.find((r) => r.id !== reading.id);
    setAnalyzing(true);
    setError(null);

    try {
      const aiResult = await fetchGroqAnalysis(reading, previous);
      const localResult = createLocalAnalysis(reading, previous);
      setAnalysis({
        ...localResult,
        overallScore: Math.max(0, Math.min(100, Math.round(aiResult.overallScore))),
        riskLevel: aiResult.riskLevel,
        analysis: aiResult.analysis,
        recommendations: aiResult.recommendations,
        nextSteps: aiResult.nextSteps,
        insights: aiResult.insights,
        summary: aiResult.summary,
        warning: aiResult.warning,
      });
    } catch {
      setAnalysis(createLocalAnalysis(reading, previous));
      setError('A análise por IA não está disponível no momento. Exibindo uma análise clínica local.');
    } finally {
      setAnalyzing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const trendData = useMemo(() => {
    const reversed = [...readings].reverse();
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    return {
      glucose: reversed.filter((r) => r.glucose != null).map((r) => ({ date: formatDate(r.created_at), value: r.glucose! })),
      systolic: reversed.filter((r) => r.systolic != null).map((r) => ({ date: formatDate(r.created_at), value: r.systolic! })),
      total_cholesterol: reversed.filter((r) => r.total_cholesterol != null).map((r) => ({ date: formatDate(r.created_at), value: r.total_cholesterol! })),
    };
  }, [readings]);

  const trendConfig = {
    glucose: { label: 'Glicose em Jejum', unit: 'mg/dL', optimalRange: [70, 99] as [number, number], color: '#0ea5e9' },
    systolic: { label: 'Pressão Sistólica', unit: 'mmHg', optimalRange: [90, 119] as [number, number], color: '#f43f5e' },
    total_cholesterol: { label: 'Colesterol Total', unit: 'mg/dL', optimalRange: [0, 200] as [number, number], color: '#f59e0b' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">VitalsAI</h1>
                <p className="text-xs text-slate-400 -mt-0.5">Painel Inteligente de Saúde</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>{readings.length} {readings.length === 1 ? 'leitura registrada' : 'leituras registradas'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-medium">
              Fechar
            </button>
          </div>
        )}

        <div className="mb-6">
          <StatCards readings={readings} />
        </div>

        {readings.length > 1 && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">Tendências dos Biomarcadores</h3>
              <div className="ml-auto flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(Object.keys(trendConfig) as (keyof typeof trendConfig)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTrend(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTrend === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {key === 'glucose' ? 'Glicose' : key === 'systolic' ? 'Pressão' : 'Colesterol'}
                  </button>
                ))}
              </div>
            </div>
            <TrendChart data={trendData[activeTrend]} label={trendConfig[activeTrend].label} unit={trendConfig[activeTrend].unit} optimalRange={trendConfig[activeTrend].optimalRange} color={trendConfig[activeTrend].color} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-2"><BiomarkerForm onSubmit={handleSubmit} loading={analyzing} /></div>
          <div className="lg:col-span-3"><AIReport analysis={analysis} loading={analyzing} /></div>
        </div>

        <ReadingHistory readings={readings} onExcluir={handleDelete} onSelect={handleSelect} />

        <footer className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            O VitalsAI fornece insights gerados por IA apenas para fins educacionais. Consulte sempre um profissional de saúde licenciado para decisões médicas.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
