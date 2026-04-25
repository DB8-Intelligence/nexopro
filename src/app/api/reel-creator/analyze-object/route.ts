import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireTenantWithRow } from '@/modules/platform/tenants/tenant-context'
import {
  FeatureNotAvailableError,
  RateLimitExceededError,
  guardAICall,
  mockJsonResponse,
} from '@/modules/platform/ai-cost-control'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedType = typeof ALLOWED_TYPES[number]

interface CharacterConcept {
  id: string
  name: string
  style: 'fotorrealista' | 'miniatura-acao' | 'pixar-3d' | 'pixar-acao' | 'pixar-antagonista' | 'pixar-humano'
  personality: string
  colorPalette: string
  prompt: string
}

interface AnalysisResult {
  object: string
  niche: string
  concepts: CharacterConcept[]
}

export async function POST(req: NextRequest) {
  const ctx = await requireTenantWithRow()
  if (ctx instanceof NextResponse) return ctx

  let simulate: boolean
  try {
    ;({ simulate } = await guardAICall({
      tenantId: ctx.tenantId,
      plan: ctx.tenant.plan,
      type: 'text',
    }))
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return NextResponse.json({ error: 'Análise de IA não disponível no seu plano' }, { status: 403 })
    }
    if (err instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: `Limite diário de análise atingido (${err.limit}/dia). Tente novamente mais tarde.` },
        { status: 429 },
      )
    }
    throw err
  }

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  const niche = formData.get('niche') as string | null

  if (!file) return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
    return NextResponse.json({ error: 'Formato inválido. Use JPG, PNG ou WEBP.' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande. Máximo 10MB.' }, { status: 400 })
  }

  if (simulate) {
    return NextResponse.json(mockJsonResponse({
      object: 'objeto-simulado',
      niche: niche ?? 'tecnico',
      concepts: [
        { id: 'A', name: 'Personagem A (sim)', style: 'fotorrealista' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt A' },
        { id: 'B', name: 'Personagem B (sim)', style: 'miniatura-acao' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt B' },
        { id: 'C', name: 'Personagem C (sim)', style: 'pixar-3d' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt C' },
        { id: 'D', name: 'Personagem D (sim)', style: 'pixar-acao' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt D' },
        { id: 'E', name: 'Personagem E (sim)', style: 'pixar-antagonista' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt E' },
        { id: 'F', name: 'Personagem F (sim)', style: 'pixar-humano' as const, personality: 'simulação', colorPalette: 'placeholder', prompt: 'simulate prompt F' },
      ],
    }))
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = file.type as AllowedType

  const nicheContext = niche ? `O cliente é do nicho: ${niche}.` : ''

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Analise esta imagem de um objeto/produto e crie 5 conceitos de personagem para reels virais do Instagram, cada um em um ESTILO DIFERENTE. ${nicheContext}

ESTILOS DISPONÍVEIS (baseados nos reels de maior engajamento):
- ESTILO A "Fotorrealista + Face Expressiva": objeto mantém textura real, face cartoon embutida, olhos salientes realistas, boca aberta com dentes, expressão extremamente exagerada. Fundo: foto real.
- ESTILO B "Miniatura de Ação": objeto vira miniatura muscular como action figure, textura plástica/borracha, pose dinâmica, em close em superfície real.
- ESTILO C "Pixar/Disney 3D": personagem Pixar com corpo completo, ambiente 3D renderizado.
- ESTILO D "Pixar 3D em Ação (Fundo Real)": Pixar 3D com corpo completo REALIZANDO ação relevante (fruta espremendo suco, suplemento levantando peso), fundo FOTO REAL (cozinha, clínica, academia). Até 1.7M views. Jaleco branco para saúde/nutrição.
- ESTILO E "Pixar 3D Antagonista (Vilão Raivoso)": Pixar 3D como VILÃO — objeto REPRESENTA um problema/despesa/dívida. Olhar furioso direto para câmera, pose intimidante. Fundo: foto real brasileira (supermercado, rua, posto gasolina, banco). Até 3M views.
- ESTILO F "Pixar 3D + Humano (Introdução)": objeto Pixar 3D COEXISTE com humano real na mesma cena doméstica. Objeto se apresenta ou ensina dica ao lado da pessoa. Ambiente doméstico caloroso (cozinha, banheiro, sala). Padrão @coisadecasa.ia: até 2M views.

Responda SOMENTE com JSON válido, sem markdown nem texto extra:

{
  "object": "nome do objeto em português",
  "niche": "nicho de mercado identificado",
  "concepts": [
    {
      "id": "A",
      "name": "Nome do Personagem",
      "style": "fotorrealista",
      "personality": "Descrição da personalidade em 1 frase em português — inclua a expressão dominante (ex: raivoso, chocado, determinado)",
      "colorPalette": "Cores dominantes do objeto ex: couro marrom + dourado",
      "prompt": "photorealistic [OBJECT_NAME] with an expressive cartoon face deeply embedded in its natural [MATERIAL] surface, [EXPRESSION: extremely angry/shocked/determined] expression, large bulging realistic eyes, thick dramatic eyebrows, wide open mouth with visible teeth, natural object texture preserved, placed in a real [RELEVANT ENVIRONMENT], cinematic lighting, ultra-detailed, 8K, 9:16 vertical"
    },
    {
      "id": "B",
      "name": "Nome do Personagem",
      "style": "miniatura-acao",
      "personality": "Descrição da personalidade em 1 frase em português",
      "colorPalette": "Cores do objeto",
      "prompt": "hyperrealistic miniature [OBJECT_NAME] character as a muscular action figure, [COLOR] plastic and rubber texture, intense [EXPRESSION] expression, dynamic action pose performing [RELEVANT ACTION], placed on a real [SURFACE] surface, macro photography, shallow depth of field, dramatic lighting, photorealistic background, 8K, 9:16 vertical"
    },
    {
      "id": "C",
      "name": "Nome do Personagem",
      "style": "pixar-3d",
      "personality": "Descrição da personalidade em 1 frase em português",
      "colorPalette": "Cores do objeto",
      "prompt": "Pixar Disney 3D animated [OBJECT_NAME] character with expressive face, articulated arms and legs, [PERSONALITY] personality, [COLOR_PALETTE], big round eyes, lip-sync ready mouth, rendered [ENVIRONMENT] background, warm cinematic lighting, Pixar render quality, 8K, 9:16 vertical"
    },
    {
      "id": "D",
      "name": "Nome do Personagem",
      "style": "pixar-acao",
      "personality": "Descrição da personalidade em 1 frase em português — inclua a ação que o personagem realiza",
      "colorPalette": "Cores do objeto",
      "prompt": "Pixar Disney 3D animated [OBJECT_NAME] character with full articulated body actively [PERFORMING SPECIFIC RELEVANT ACTION], expressive lip-sync face, [COLOR_PALETTE], [white lab coat if health/nutrition niche], composited onto a real photographic [RELEVANT REAL ENVIRONMENT: modern kitchen/clinic/gym], photorealistic background, warm cinematic lighting, Pixar render quality, ultra-detailed, 8K, 9:16 vertical"
    },
    {
      "id": "E",
      "name": "Nome Antagonista do Personagem",
      "style": "pixar-antagonista",
      "personality": "Descrição em 1 frase em português de como o objeto representa um problema/despesa que aflige o consumidor — tom raivoso e ameaçador",
      "colorPalette": "Cores do objeto",
      "prompt": "Pixar Disney 3D animated [OBJECT_NAME] character as a menacing villain antagonist, full body with arms and legs, intensely furious expression glaring directly at camera, clenched fists, [COLOR_PALETTE], standing defiantly in a real photographic Brazilian [RELEVANT REAL ENVIRONMENT: supermarket/gas station/bank/street], photorealistic background, dramatic moody cinematic lighting with dark shadows, Pixar render quality, ultra-detailed, 8K, 9:16 vertical"
    },
    {
      "id": "F",
      "name": "Nome do Personagem Doméstico",
      "style": "pixar-humano",
      "personality": "Descrição em 1 frase em português de como o objeto se apresenta e qual dica ou função ele ensina ao consumidor — tom amigável e educativo",
      "colorPalette": "Cores do objeto",
      "prompt": "Pixar Disney 3D animated [OBJECT_NAME] character with expressive friendly face and full body, appearing alongside a real person in a warm domestic [RELEVANT REAL ENVIRONMENT: kitchen/bathroom/living room], photorealistic background with real human figure in scene, character introducing itself and gesturing warmly, natural warm home lighting, 3D animated character composited into real domestic setting, Pixar render quality, ultra-detailed, 8K, 9:16 vertical"
    }
  ]
}`,
          },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    // Strip potential markdown code fences
    const json = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(json) as AnalysisResult

    if (!parsed.concepts?.length) {
      return NextResponse.json({ error: 'Análise incompleta. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Falha na análise' },
      { status: 500 }
    )
  }
}
