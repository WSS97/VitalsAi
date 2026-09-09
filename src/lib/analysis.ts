import type { BiomarkerReading } from './supabase';

export type Status = 'optimal' | 'normal' | 'borderline' | 'high' | 'low' | 'critical';

export interface MetricResult {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  status: Status;
  range: [number, number];
  optimalRange: [number, number];
  recommendation: string;
  category: string;
}

export interface AnalysisResult {
  metrics: MetricResult[];
  overallScore: number;
  riskLevel: string;
  analysis: string[];
  recommendations: string[];
  nextSteps: string[];
  insights: string[];
  summary: string;
  warning: string;
  trends: { label: string; direction: 'up' | 'down' | 'stable'; change: number }[];
}

function classify(value: number, optimal: [number, number], borderline: [number, number], high: [number, number]): Status {
  if (value >= optimal[0] && value <= optimal[1]) return 'optimal';
  if (value >= borderline[0] && value <= borderline[1]) return 'borderline';
  if (value >= high[0]) return 'high';
  return 'low';
}

function bpClassify(systolic: number, diastolic: number): Status {
  if (systolic >= 180 || diastolic >= 120) return 'critical';
  if (systolic >= 140 || diastolic >= 90) return 'high';
  if (systolic >= 120 || diastolic >= 80) return 'borderline';
  if (systolic >= 90 && systolic < 120 && diastolic >= 60 && diastolic < 80) return 'optimal';
  return 'low';
}

const STATUS_SCORES: Record<Status, number> = {
  optimal: 100,
  normal: 85,
  borderline: 65,
  high: 40,
  low: 35,
  critical: 15,
};

export function analyzeReading(reading: BiomarkerReading, previous?: BiomarkerReading): AnalysisResult {
  const metrics: MetricResult[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  const trends: AnalysisResult['trends'] = [];

  // Glicose
  if (reading.glucose != null) {
    const status = classify(reading.glucose, [70, 99], [100, 125], [126, 1000]);
    metrics.push({
      key: 'glucose',
      label: 'Glicose em Jejum',
      value: reading.glucose,
      unit: 'mg/dL',
      status,
      range: [50, 200],
      optimalRange: [70, 99],
      category: 'Açúcar no Sangue',
      recommendation:
        status === 'optimal'
          ? 'Sua glicose em jejum está na faixa ideal. Mantenha seus hábitos atuais de alimentação e exercícios.'
          : status === 'borderline'
            ? 'Considere reduzir o consumo de açúcar refinado e aumentar a ingestão de fibras. Busque 150 min/semana de exercício moderado.'
            : status === 'high'
              ? 'Glicose em jejum elevada pode indicar pré-diabetes ou diabetes. Consulte um profissional de saúde para exames adicionais (HbA1c).'
              : 'Açúcar no sangue baixo pode causar tontura e confusão. Faça refeições regulares e consulte um médico se recorrente.',
    });
    if (status === 'high') insights.push('Glicose em jejum acima de 126 mg/dL é um limiar clínico para rastreamento de diabetes.');
    if (previous?.glucose != null) {
      const change = reading.glucose - previous.glucose;
      trends.push({ label: 'Glicose', direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable', change });
    }
  }

  // Pressão Arterial
  if (reading.systolic != null && reading.diastolic != null) {
    const status = bpClassify(reading.systolic, reading.diastolic);
    metrics.push({
      key: 'blood_pressure',
      label: 'Pressão Arterial',
      value: reading.systolic,
      unit: 'mmHg',
      status,
      range: [80, 200],
      optimalRange: [90, 119],
      category: 'Cardiovascular',
      recommendation:
        status === 'optimal'
          ? 'A pressão arterial está ideal. Mantenha o consumo de sódio abaixo de 2.300 mg/dia e permaneça ativo.'
          : status === 'borderline'
            ? 'Pressão arterial elevada — reduza o sódio, controle o estresse e monitore regularmente. Dieta DASH recomendada.'
            : status === 'high'
              ? 'Hipertensão estágio 2. Mudanças no estilo de vida são essenciais; medicação pode ser necessária. Procure um médico.'
              : status === 'critical'
                ? 'Crise hipertensiva — procure atendimento médico imediato se acompanhada de sintomas.'
                : 'Pressão arterial baixa. Mantenha-se hidratado e levante-se devagar. Consulte um médico se sintomático.',
    });
    if (status === 'high' || status === 'critical') insights.push(`Pressão arterial ${reading.systolic}/${reading.diastolic} mmHg excede o limite saudável.`);
    if (previous?.systolic != null) {
      const change = reading.systolic - previous.systolic;
      trends.push({ label: 'PA Sistólica', direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable', change });
    }
  }

  // Colesterol Total
  if (reading.total_cholesterol != null) {
    const status = classify(reading.total_cholesterol, [0, 200], [200, 239], [240, 1000]);
    metrics.push({
      key: 'total_cholesterol',
      label: 'Colesterol Total',
      value: reading.total_cholesterol,
      unit: 'mg/dL',
      status,
      range: [50, 350],
      optimalRange: [0, 200],
      category: 'Painel Lipídico',
      recommendation:
        status === 'optimal'
          ? 'O colesterol total está em uma faixa desejável. Continue com padrões alimentares saudáveis para o coração.'
          : status === 'borderline'
            ? 'Colesterol limítrofe-alto. Aumente a fibra solúvel (aveia, feijão) e reduza as gorduras saturadas.'
            : 'Colesterol alto aumenta o risco cardiovascular. Discuta terapia com estatinas ou mudanças de estilo de vida com seu médico.',
    });
    if (previous?.total_cholesterol != null) {
      const change = reading.total_cholesterol - previous.total_cholesterol;
      trends.push({ label: 'Colesterol Total', direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable', change });
    }
  }

  // HDL
  if (reading.hdl != null) {
    let hdlStatus: Status;
    if (reading.hdl >= 60) hdlStatus = 'optimal';
    else if (reading.hdl >= 40) hdlStatus = 'normal';
    else hdlStatus = 'low';
    metrics.push({
      key: 'hdl',
      label: 'Colesterol HDL',
      value: reading.hdl,
      unit: 'mg/dL',
      status: hdlStatus,
      range: [10, 100],
      optimalRange: [60, 100],
      category: 'Painel Lipídico',
      recommendation:
        hdlStatus === 'optimal'
          ? 'Níveis excelentes de HDL — protetor contra doenças cardíacas. Continue com exercícios aeróbicos regulares.'
          : hdlStatus === 'normal'
            ? 'O HDL está aceitável. Exercícios cardiovasculares e gorduras saudáveis (azeite, nozes) podem elevá-lo ainda mais.'
            : 'HDL baixo é um fator de risco cardiovascular. Aumente a atividade física e evite gorduras trans.',
    });
    if (hdlStatus === 'low') insights.push('Colesterol HDL baixo reduz sua proteção cardiovascular.');
  }

  // LDL
  if (reading.ldl != null) {
    const status = classify(reading.ldl, [0, 100], [100, 159], [160, 1000]);
    metrics.push({
      key: 'ldl',
      label: 'Colesterol LDL',
      value: reading.ldl,
      unit: 'mg/dL',
      status,
      range: [20, 250],
      optimalRange: [0, 100],
      category: 'Painel Lipídico',
      recommendation:
        status === 'optimal'
          ? 'O LDL está ideal. Seu perfil lipídico apoia a saúde do coração.'
          : status === 'borderline'
            ? 'LDL limítrofe-alto. Limite carnes vermelhas e laticínios integrais; adicione fitosteróis via nozes e sementes.'
            : 'LDL alto é um importante fator de risco para doenças cardíacas. Discuta opções de tratamento com seu médico.',
    });
    if (status === 'high') insights.push('Colesterol LDL acima de 160 mg/dL aumenta significativamente o risco aterosclerótico.');
  }

  // Triglicerídeos
  if (reading.triglycerides != null) {
    const status = classify(reading.triglycerides, [0, 150], [150, 199], [200, 5000]);
    metrics.push({
      key: 'triglycerides',
      label: 'Triglicerídeos',
      value: reading.triglycerides,
      unit: 'mg/dL',
      status,
      range: [20, 500],
      optimalRange: [0, 150],
      category: 'Painel Lipídico',
      recommendation:
        status === 'optimal'
          ? 'Os triglicerídeos estão em uma faixa saudável. Continue limitando açúcares adicionados e álcool.'
          : status === 'borderline'
            ? 'Triglicerídeos limítrofes-alto. Reduza bebidas açucaradas e carboidratos refinados; adicione peixes ricos em ômega-3.'
            : 'Triglicerídeos altos. Reduza álcool, açúcar e carboidratos refinados. Suplementação de ômega-3 pode ajudar.',
    });
    if (status === 'high') insights.push('Triglicerídeos altos combinados com HDL baixo aumentam o risco de síndrome metabólica.');
  }

  // Pontuação geral
  const scoredMetrics = metrics.filter((m) => m.value != null);
  const overallScore = scoredMetrics.length > 0
    ? Math.round(scoredMetrics.reduce((sum, m) => sum + STATUS_SCORES[m.status], 0) / scoredMetrics.length)
    : 0;

  let riskLevel: string;
  if (overallScore >= 85) riskLevel = 'Baixo Risco';
  else if (overallScore >= 65) riskLevel = 'Risco Moderado';
  else if (overallScore >= 40) riskLevel = 'Risco Elevado';
  else riskLevel = 'Alto Risco';

  // Construir insights e recomendações
  for (const m of metrics) {
    if (m.status === 'high' || m.status === 'critical' || m.status === 'low') {
      recommendations.push(`${m.label}: ${m.recommendation}`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Todos os biomarcadores estão dentro de faixas saudáveis. Continue seus hábitos de saúde atuais e agende exames anuais.');
  }

  if (overallScore < 65) {
    insights.push('Múltiplos biomarcadores estão fora das faixas ideais. Uma revisão abrangente do estilo de vida é recomendada.');
  } else if (overallScore >= 85) {
    insights.push('Seu perfil de biomarcadores indica saúde metabólica e cardiovascular forte.');
  }

  // Insights de tendência
  for (const t of trends) {
    if (t.direction === 'up' && t.change > 10) {
      insights.push(`${t.label} aumentou ${Math.abs(t.change).toFixed(0)} desde sua última leitura — monitore de perto.`);
    } else if (t.direction === 'down' && t.change < -10) {
      insights.push(`${t.label} melhorou ${Math.abs(t.change).toFixed(0)} desde sua última leitura — excelente progresso.`);
    }
  }

  return { metrics, overallScore, riskLevel, analysis: [], recommendations, nextSteps: [], insights, summary: '', warning: '', trends };
}

export const STATUS_COLORS: Record<Status, { bg: string; text: string; border: string; dot: string; label: string }> = {
  optimal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Ideal' },
  normal: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'Normal' },
  borderline: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Limítrofe' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Alto' },
  low: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', label: 'Baixo' },
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-600', label: 'Crítico' },
};
