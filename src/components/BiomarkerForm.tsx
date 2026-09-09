import { useState } from 'react';
import { Activity, Droplet, HeartPulse, Loader2, Plus } from 'lucide-react';
import type { BiomarkerInput } from '@/lib/supabase';

interface BiomarkerFormProps {
  onSubmit: (data: BiomarkerInput) => Promise<void>;
  loading: boolean;
}

interface FieldConfig {
  key: keyof BiomarkerInput;
  label: string;
  placeholder: string;
  unit: string;
  icon: 'activity' | 'droplet' | 'heart';
}

const GLUCOSE_FIELDS: FieldConfig[] = [
  { key: 'glucose', label: 'Glicose em Jejum', placeholder: '90', unit: 'mg/dL', icon: 'droplet' },
];

const BP_FIELDS: FieldConfig[] = [
  { key: 'systolic', label: 'Sistólica', placeholder: '120', unit: 'mmHg', icon: 'heart' },
  { key: 'diastolic', label: 'Diastólica', placeholder: '80', unit: 'mmHg', icon: 'heart' },
];

const LIPID_FIELDS: FieldConfig[] = [
  { key: 'total_cholesterol', label: 'Colesterol Total', placeholder: '180', unit: 'mg/dL', icon: 'activity' },
  { key: 'hdl', label: 'HDL', placeholder: '55', unit: 'mg/dL', icon: 'activity' },
  { key: 'ldl', label: 'LDL', placeholder: '100', unit: 'mg/dL', icon: 'activity' },
  { key: 'triglycerides', label: 'Triglicerídeos', placeholder: '120', unit: 'mg/dL', icon: 'activity' },
];

const ALL_FIELDS = [...GLUCOSE_FIELDS, ...BP_FIELDS, ...LIPID_FIELDS];

function FieldIcon({ icon }: { icon: FieldConfig['icon'] }) {
  if (icon === 'droplet') return <Droplet className="w-4 h-4 text-sky-500" />;
  if (icon === 'heart') return <HeartPulse className="w-4 h-4 text-rose-500" />;
  return <Activity className="w-4 h-4 text-amber-500" />;
}

export function BiomarkerForm({ onSubmit, loading }: BiomarkerFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hasAny = ALL_FIELDS.some((f) => values[f.key]?.trim());
    if (!hasAny) {
      setError('Insira pelo menos um valor de biomarcador.');
      return;
    }

    const data: BiomarkerInput = {
      glucose: values.glucose ? parseFloat(values.glucose) : null,
      systolic: values.systolic ? parseInt(values.systolic) : null,
      diastolic: values.diastolic ? parseInt(values.diastolic) : null,
      total_cholesterol: values.total_cholesterol ? parseFloat(values.total_cholesterol) : null,
      hdl: values.hdl ? parseFloat(values.hdl) : null,
      ldl: values.ldl ? parseFloat(values.ldl) : null,
      triglycerides: values.triglycerides ? parseFloat(values.triglycerides) : null,
      notes: notes.trim(),
    };

    await onSubmit(data);

    setValues({});
    setNotes('');
  };

  const renderField = (f: FieldConfig) => (
    <div key={f.key}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
        <FieldIcon icon={f.icon} />
        {f.label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={values[f.key] ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          placeholder={f.placeholder}
          className="w-full px-3 py-2.5 pr-14 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all tabular-nums"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{f.unit}</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
          <Plus className="w-4 h-4 text-sky-600" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Nova Leitura</h3>
      </div>

      {/* Açúcar no Sangue */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Açúcar no Sangue</p>
        <div className="grid grid-cols-1 gap-3">{GLUCOSE_FIELDS.map(renderField)}</div>
      </div>

      {/* Pressão Arterial */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Pressão Arterial</p>
        <div className="grid grid-cols-2 gap-3">{BP_FIELDS.map(renderField)}</div>
      </div>

      {/* Lipid Panel */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Lipid Panel</p>
        <div className="grid grid-cols-2 gap-3">{LIPID_FIELDS.map(renderField)}</div>
      </div>

      {/* Observações */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Observações (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Em jejum, após exercício, etc."
          rows={2}
          className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {loading ? 'Analisando...' : 'Analisar Biomarcadores'}
      </button>
    </form>
  );
}
