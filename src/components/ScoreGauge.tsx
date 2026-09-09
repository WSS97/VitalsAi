import { useMemo } from 'react';

interface ScoreGaugeProps {
  score: number;
  riskLevel: string;
}

export function ScoreGauge({ score, riskLevel }: ScoreGaugeProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = useMemo(() => {
    if (score >= 85) return '#10b981';
    if (score >= 65) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-800 tabular-nums">{score}</span>
        <span className="text-sm font-medium text-slate-500 mt-1">{riskLevel}</span>
      </div>
    </div>
  );
}
