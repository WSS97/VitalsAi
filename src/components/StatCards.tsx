import { Droplet, HeartPulse, Activity, FlaskConical } from 'lucide-react';
import type { BiomarkerReading } from '@/lib/supabase';

interface StatCardsProps {
  readings: BiomarkerReading[];
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  iconBg: string;
}

export function StatCards({ readings }: StatCardsProps) {
  const latest = readings[0];
  const total = readings.length;

  const avgGlucose = readings.filter((r) => r.glucose != null).map((r) => r.glucose!);
  const avgSys = readings.filter((r) => r.systolic != null).map((r) => r.systolic!);
  const avgChol = readings.filter((r) => r.total_cholesterol != null).map((r) => r.total_cholesterol!);

  const items: StatItem[] = [
    {
      label: 'Última Glicose',
      value: latest?.glucose != null ? `${latest.glucose} mg/dL` : '—',
      icon: <Droplet className="w-5 h-5" />,
      bg: 'bg-white',
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Última PA',
      value: latest?.systolic != null ? `${latest.systolic}/${latest.diastolic}` : '—',
      icon: <HeartPulse className="w-5 h-5" />,
      bg: 'bg-white',
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Colesterol Médio',
      value: avgChol.length > 0 ? `${Math.round(avgChol.reduce((a, b) => a + b, 0) / avgChol.length)} mg/dL` : '—',
      icon: <Activity className="w-5 h-5" />,
      bg: 'bg-white',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Total de Leituras',
      value: `${total}`,
      icon: <FlaskConical className="w-5 h-5" />,
      bg: 'bg-white',
      iconBg: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div key={i} className={`${item.bg} rounded-2xl border border-slate-200 shadow-sm p-4 transition-all hover:shadow-md`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}>
              {item.icon}
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-1">{item.label}</p>
          <p className="text-xl font-bold text-slate-800 tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
