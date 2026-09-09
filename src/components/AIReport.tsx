import { Sparkles, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { AnalysisResult } from '@/lib/analysis';
import { ScoreGauge } from './ScoreGauge';
import { MetricRangeBar } from './MetricRangeBar';

interface AIReportProps {
  analysis: AnalysisResult | null;
  loading: boolean;
}

export function AIReport({ analysis, loading }: AIReportProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-sm text-slate-500">A IA está analisando seus biomarcadores...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Relatório de Saúde por IA</h3>
        <p className="text-sm text-slate-400 text-center max-w-xs">
          Insira seus biomarcadores e envie para receber uma análise de saúde por IA com recomendações personalizadas.
        </p>
      </div>
    );
  }

  const riskColor =
    analysis.riskLevel === 'Baixo Risco'
      ? 'text-emerald-600 bg-emerald-50'
      : analysis.riskLevel === 'Risco Moderado'
        ? 'text-amber-600 bg-amber-50'
        : analysis.riskLevel === 'Risco Elevado'
          ? 'text-orange-600 bg-orange-50'
          : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Pontuação de Saúde por IA</h3>
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${riskColor}`}>
            {analysis.riskLevel}
          </span>
        </div>
        <div className="flex flex-col items-center py-2">
          <ScoreGauge score={analysis.overallScore} riskLevel={analysis.riskLevel} />
        </div>
      </div>

      {analysis.summary && (
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
          <p className="text-sm leading-6 text-sky-900">{analysis.summary}</p>
        </div>
      )}

      {/* Metrics */}
      {analysis.metrics.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Análise dos Biomarcadores</h3>
          <div className="space-y-5">
            {analysis.metrics.map((m) => (
              <MetricRangeBar key={m.key} metric={m} />
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-semibold text-slate-800">Principais Insights</h3>
          </div>
          <ul className="space-y-2.5">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trends */}
      {analysis.trends.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Tendências vs. Última Leitura</h3>
          <div className="grid grid-cols-2 gap-3">
            {analysis.trends.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                {t.direction === 'up' ? (
                  <TrendingUp className={`w-4 h-4 ${t.change > 10 ? 'text-red-500' : 'text-slate-400'}`} />
                ) : t.direction === 'down' ? (
                  <TrendingDown className={`w-4 h-4 ${t.change < -10 ? 'text-emerald-500' : 'text-slate-400'}`} />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <p className="text-xs font-medium text-slate-600">{t.label}</p>
                  <p className="text-xs text-slate-400">
                    {t.change > 0 ? '+' : ''}{t.change.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-sky-500" />
          <h3 className="text-base font-semibold text-slate-800">Recomendações da IA</h3>
        </div>
        <ul className="space-y-3">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">
            Esta análise por IA tem finalidade exclusivamente informativa e não constitui aconselhamento médico. Consulte sempre um profissional de saúde qualificado.
          </p>
        </div>
      </div>
    </div>
  );
}
