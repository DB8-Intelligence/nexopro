import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedType = typeof ALLOWED_TYPES[number]

interface CharacterConcept {
  id: string
  name: string
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

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

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = file.type as AllowedType

  const nicheContext = niche ? `O cliente é do nicho: ${niche}.` : ''

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Analise esta imagem de um objeto/produto e crie 3 conceitos únicos de personagem Pixar/Disney 3D animado. ${nicheContext}

Cada conceito deve ter personalidade distinta. Responda SOMENTE com JSON válido, sem markdown nem texto extra:

{
  "object": "nome do objeto em português",
  "niche": "nicho de mercado identificado",
  "concepts": [
    {
      "id": "A",
      "name": "Nome do Personagem",
      "personality": "Descrição da personalidade em 1 frase (português)",
      "colorPalette": "Cores dominantes ex: prata + azul elétrico",
      "prompt": "photorealistic Pixar Disney 3D animated [OBJECT_NAME] character with expressive face, [PERSONALITY: friendly/energetic/sophisticated], [COLOR_PALETTE], big round eyes, lip-sync ready open mouth, clean gradient background, soft rim lighting, subsurface scattering, 8K render, 9:16 vertical aspect ratio"
    },
    { "id": "B", ... },
    { "id": "C", ... }
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
