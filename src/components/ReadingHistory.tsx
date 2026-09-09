import { useState } from 'react';
import { Trash2, ChevronDown, History } from 'lucide-react';
import type { BiomarkerReading } from '@/lib/supabase';

interface ReadingHistoryProps {
  readings: BiomarkerReading[];
  onExcluir: (id: string) => Promise<void>;
  onSelect: (reading: BiomarkerReading) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: 'numeric', minute: '2-digit' });
}

export function ReadingHistory({ readings, onExcluir, onSelect }: ReadingHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
          <History className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm text-slate-400">Nenhuma leitura ainda. Envie seu primeiro biomarcador para começar a acompanhar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-5 border-b border-slate-100">
        <History className="w-4 h-4 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-800">Histórico de Leituras</h3>
        <span className="ml-auto text-xs text-slate-400">{readings.length} {readings.length === 1 ? 'entrada' : 'entradas'}</span>
      </div>
      <div className="divide-y divide-slate-50">
        {readings.map((r) => (
          <div key={r.id} className="group">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-slate-500">
                  {formatDate(r.created_at).split(' ')[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{formatDate(r.created_at)}</p>
                <p className="text-xs text-slate-400">{formatTime(r.created_at)}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs">
                {r.glucose != null && (
                  <div className="text-center">
                    <p className="text-slate-400">Glicose</p>
                    <p className="font-semibold text-slate-700 tabular-nums">{r.glucose}</p>
                  </div>
                )}
                {r.systolic != null && (
                  <div className="text-center">
                    <p className="text-slate-400">BP</p>
                    <p className="font-semibold text-slate-700 tabular-nums">{r.systolic}/{r.diastolic}</p>
                  </div>
                )}
                {r.total_cholesterol != null && (
                  <div className="text-center">
                    <p className="text-slate-400">Colesterol</p>
                    <p className="font-semibold text-slate-700 tabular-nums">{r.total_cholesterol}</p>
                  </div>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
            </div>

            {expanded === r.id && (
              <div className="px-4 pb-4 bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: 'Glicose', value: r.glucose, unit: 'mg/dL' },
                    { label: 'Sistólica', value: r.systolic, unit: 'mmHg' },
                    { label: 'Diastólica', value: r.diastolic, unit: 'mmHg' },
                    { label: 'Colesterol Total', value: r.total_cholesterol, unit: 'mg/dL' },
                    { label: 'HDL', value: r.hdl, unit: 'mg/dL' },
                    { label: 'LDL', value: r.ldl, unit: 'mg/dL' },
                    { label: 'Triglicerídeos', value: r.triglycerides, unit: 'mg/dL' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-lg border border-slate-100 px-3 py-2">
                      <p className="text-xs text-slate-400">{m.label}</p>
                      <p className="text-sm font-semibold text-slate-700 tabular-nums">
                        {m.value != null ? `${m.value} ${m.unit}` : '—'}
                      </p>
                    </div>
                  ))}
                </div>
                {r.notes && (
                  <p className="text-sm text-slate-500 italic mb-3 px-1">"{r.notes}"</p>
                )}
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => onSelect(r)}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    Ver Análise
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => onExcluir(r.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
