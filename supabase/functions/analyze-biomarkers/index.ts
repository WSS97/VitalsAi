import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BiomarkerData {
  glucose: number | null;
  systolic: number | null;
  diastolic: number | null;
  total_cholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;
  notes: string;
}

interface PreviousReading extends BiomarkerData {
  created_at: string;
}

interface AnalysisRequest {
  current: BiomarkerData;
  previous?: PreviousReading | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { current, previous } = (await req.json()) as AnalysisRequest;

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY não configurada no servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const biomarkerText = formatBiomarkers(current, previous);

    const systemPrompt = `Você é um assistente de IA especialista em medicina preventiva e análise de dados biométricos. Com base nos marcadores de saúde fornecidos pelo usuário (glicemia, pressão arterial, colesterol, etc.), gere um relatório estruturado e personalizado. O relatório deve conter obrigatoriamente: 1) Uma análise direta se os indicadores estão nas faixas seguras ou de alerta, 2) Recomendações práticas e fundamentadas de hábitos saudáveis, 3) Próximos passos sugeridos. Responda estritamente em português brasileiro (pt-BR), utilizando formatação Markdown limpa, sem jargões excessivamente complexos e mantendo um tom encorajador e profissional. Nunca forneça diagnósticos médicos definitivos, sempre inclua um aviso para consultar um médico.

Você DEVE responder APENAS com um objeto JSON válido, sem markdown, sem texto adicional, no seguinte formato exato:

{
  "overallScore": <número inteiro 0-100>,
  "riskLevel": "<Baixo Risco | Risco Moderado | Risco Elevado | Alto Risco>",
  "analysis": ["<string: análise direta de cada indicador, indicando se está em faixa segura ou de alerta>"],
  "recommendations": ["<string: recomendações práticas e fundamentadas de hábitos saudáveis>"],
  "nextSteps": ["<string: próximos passos sugeridos>"],
  "insights": ["<string: insights clínicos relevantes>"],
  "summary": "<string com resumo geral encorajador em português>",
  "warning": "<string: aviso de que não é diagnóstico médico e que se deve consultar um médico>"
}`;

    const userPrompt = `Analise os seguintes dados de biomarcadores e gere o relatório de saúde em português brasileiro (pt-BR):

${biomarkerText}

Responda APENAS com o JSON estruturado conforme especificado, incluindo obrigatoriamente os campos "analysis", "recommendations", "nextSteps" e "warning".`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Erro na API Groq: ${response.status}`, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const groqData = await response.json();
    const content = groqData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia da API Groq." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: "Falha ao analisar a resposta JSON da IA.", raw: content }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function formatBiomarkers(current: BiomarkerData, previous?: PreviousReading | null): string {
  const lines: string[] = ["=== LEITURA ATUAL ==="];

  if (current.glucose != null) lines.push(`- Glicose em jejum: ${current.glucose} mg/dL`);
  if (current.systolic != null && current.diastolic != null)
    lines.push(`- Pressão arterial: ${current.systolic}/${current.diastolic} mmHg`);
  if (current.total_cholesterol != null) lines.push(`- Colesterol total: ${current.total_cholesterol} mg/dL`);
  if (current.hdl != null) lines.push(`- HDL: ${current.hdl} mg/dL`);
  if (current.ldl != null) lines.push(`- LDL: ${current.ldl} mg/dL`);
  if (current.triglycerides != null) lines.push(`- Triglicerídeos: ${current.triglycerides} mg/dL`);
  if (current.notes) lines.push(`- Observações: ${current.notes}`);

  if (previous) {
    lines.push("", "=== LEITURA ANTERIOR ===");
    if (previous.created_at) lines.push(`- Data: ${previous.created_at}`);
    if (previous.glucose != null) lines.push(`- Glicose em jejum: ${previous.glucose} mg/dL`);
    if (previous.systolic != null && previous.diastolic != null)
      lines.push(`- Pressão arterial: ${previous.systolic}/${previous.diastolic} mmHg`);
    if (previous.total_cholesterol != null) lines.push(`- Colesterol total: ${previous.total_cholesterol} mg/dL`);
    if (previous.hdl != null) lines.push(`- HDL: ${previous.hdl} mg/dL`);
    if (previous.ldl != null) lines.push(`- LDL: ${previous.ldl} mg/dL`);
    if (previous.triglycerides != null) lines.push(`- Triglicerídeos: ${previous.triglycerides} mg/dL`);
  }

  return lines.join("\n");
}
