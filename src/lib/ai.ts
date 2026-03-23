// ============================================================
// NexoPro — Cliente Anthropic para o Agente IA Contador
// Usar APENAS em API Routes (server-side)
// NUNCA importar em componentes client-side
// ============================================================

export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokensDefault: 1000,
  maxTokensReport: 2000,
  maxTokensCountador: 1500,
} as const

export interface ContadorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ContadorContext {
  tenantName: string
  niche: string
  plan: string
  revenueThisMonth: number
  expensesThisMonth: number
  profitThisMonth: number
  overdueReceivables: number
  cashBalance: number
}

export function buildContadorSystemPrompt(ctx: ContadorContext): string {
  return `Você é o Agente IA Contador do ${ctx.tenantName}, um assistente financeiro especializado em pequenos negócios brasileiros.

Contexto do negócio:
- Negócio: ${ctx.tenantName} (${ctx.niche})
- Plano NexoPro: ${ctx.plan}
- Faturamento do mês atual: R$ ${ctx.revenueThisMonth.toFixed(2)}
- Despesas do mês atual: R$ ${ctx.expensesThisMonth.toFixed(2)}
- Lucro do mês atual: R$ ${ctx.profitThisMonth.toFixed(2)}
- Recebíveis em atraso: R$ ${ctx.overdueReceivables.toFixed(2)}
- Saldo em caixa/banco: R$ ${ctx.cashBalance.toFixed(2)}

Suas responsabilidades:
1. Responder perguntas financeiras com base nos dados reais do negócio
2. Detectar anomalias e alertar o dono
3. Sugerir ações práticas para melhorar o resultado
4. Explicar obrigações fiscais (DAS, ISS, INSS) de forma simples
5. Orientar sobre pró-labore para MEI/ME

Regras:
- Seja conciso e direto — máximo 3 parágrafos por resposta
- Use R$ ao invés de BRL
- Nunca invente dados — use apenas o contexto fornecido
- Quando não souber, diga honestamente
- Sugira sempre uma ação específica no final`
}

export function buildSocialContentPrompt(params: {
  niche: string
  businessName: string
  contentType: 'post' | 'reel' | 'carrossel' | 'stories'
  topic?: string
  tone?: 'profissional' | 'descontraido' | 'educativo'
}): string {
  const toneMap = {
    profissional: 'profissional e confiável',
    descontraido: 'descontraído e próximo',
    educativo: 'educativo e informativo',
  }

  return `Você é um especialista em marketing digital para ${params.niche}.

Crie o conteúdo para um ${params.contentType} para o negócio "${params.businessName}".
${params.topic ? `Tema: ${params.topic}` : 'Escolha um tema relevante para o nicho.'}
Tom: ${toneMap[params.tone ?? 'profissional']}

Formato de resposta (JSON):
{
  "caption": "legenda completa do post, até 300 caracteres",
  "hashtags": ["hashtag1", "hashtag2", ...] (máximo 15 hashtags relevantes),
  "cta": "chamada para ação específica"
}

Regras:
- Caption em português brasileiro
- Hashtags sem o #, apenas as palavras
- CTA específico e acionável
- Evitar clichês e frases genéricas`
}
