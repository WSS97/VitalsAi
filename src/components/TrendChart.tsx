import { useMemo } from 'react';

interface TrendChartProps {
  data: { date: string; value: number }[];
  label: string;
  unit: string;
  optimalRange?: [number, number];
  color?: string;
}

export function TrendChart({ data, label, unit, optimalRange, color = '#0ea5e9' }: TrendChartProps) {
  const { path, areaPath, points, minVal, maxVal, width, height } = useMemo(() => {
    const w = 520;
    const h = 180;
    const padX = 40;
    const padY = 30;
    if (data.length === 0) return { path: '', areaPath: '', points: [], minVal: 0, maxVal: 0, width: w, height: h };

    const values = data.map((d) => d.value);
    const min = Math.min(...values, optimalRange?.[0] ?? Infinity);
    const max = Math.max(...values, optimalRange?.[1] ?? -Infinity);
    const range = max - min || 1;

    const stepX = (w - padX * 2) / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
      x: padX + i * stepX,
      y: padY + (h - padY * 2) * (1 - (d.value - min) / range),
      value: d.value,
      date: d.date,
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const aPath = `${linePath} L ${pts[pts.length - 1].x} ${h - padY} L ${pts[0].x} ${h - padY} Z`;

    return { path: linePath, areaPath: aPath, points: pts, minVal: min, maxVal: max, width: w, height: h };
  }, [data, optimalRange]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
        Ainda não há dados de tendência — adicione mais leituras para acompanhar seu progresso.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">Tendência de {label}</h4>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 200 }}>
        <defs>
          <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Optimal range band */}
        {optimalRange && (
          <rect
            x={40}
            y={30 + (180 - 60) * (1 - (optimalRange[1] - minVal) / (maxVal - minVal || 1))}
            width={width - 80}
            height={(180 - 60) * ((optimalRange[1] - optimalRange[0]) / (maxVal - minVal || 1))}
            fill="#10b981"
            fillOpacity="0.08"
            rx="4"
          />
        )}

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={40}
            x2={width - 40}
            y1={30 + t * 120}
            y2={30 + t * 120}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        {/* Area */}
        <path d={areaPath} fill={`url(#grad-${label.replace(/\s/g, '')})`} />

        {/* Line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
          </g>
        ))}

        {/* X labels */}
        {points.map((p, i) => {
          if (points.length > 8 && i % Math.ceil(points.length / 6) !== 0 && i !== points.length - 1) return null;
          return (
            <text key={`l-${i}`} x={p.x} y={height - 8} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
              {p.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
