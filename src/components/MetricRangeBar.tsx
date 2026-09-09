import type { MetricResult } from '@/lib/analysis';
import { STATUS_COLORS } from '@/lib/analysis';

interface MetricRangeBarProps {
  metric: MetricResult;
}

export function MetricRangeBar({ metric }: MetricRangeBarProps) {
  if (metric.value == null) return null;

  const [min, max] = metric.range;
  const range = max - min;
  const valuePct = ((metric.value - min) / range) * 100;
  const optimalStart = ((metric.optimalRange[0] - min) / range) * 100;
  const optimalWidth = ((metric.optimalRange[1] - metric.optimalRange[0]) / range) * 100;

  const colors = STATUS_COLORS[metric.status];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <span className="text-sm font-medium text-slate-700">{metric.label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-800 tabular-nums">
            {metric.key === 'blood_pressure' ? `${metric.value}/—` : metric.value}
          </span>
          <span className="text-xs text-slate-400">{metric.unit}</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
        {/* Optimal range band */}
        <div
          className="absolute h-full bg-emerald-200/60 rounded-full"
          style={{ left: `${optimalStart}%`, width: `${optimalWidth}%` }}
        />
        {/* Value marker */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${colors.dot} ring-2 ring-white shadow-md`}
          style={{ left: `${Math.max(0, Math.min(100, valuePct))}%`, transition: 'left 0.6s ease' }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span className={`font-medium ${colors.text}`}>{colors.label}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
