import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  CONTENT_PERSONAS,
  generateBioSuggestion,
} from '@/lib/content-ai/content-personas'
import type { PersonaId } from '@/lib/content-ai/content-personas'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ProfileSuggestion {
  bio: string
  ctaOptions: string[]
  hashtagsPost: string[]     // 15 hashtags ready for a post
  contentPillars: string[]
  captionHooks: string[]
  postingSchedule: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as {
    personaId: PersonaId
    businessName?: string
    specialty?: string
    city?: string
    phone?: string
    niche?: string
    extraContext?: string    // any extra info the user wants to include
  }

  if (!body.personaId || !CONTENT_PERSONAS[body.personaId]) {
    return NextResponse.json({ error: 'personaId inválido.' }, { status: 400 })
  }

  const persona = CONTENT_PERSONAS[body.personaId]

  // Generate bio using template as a starting point
  const bioBase = generateBioSuggestion({
    personaId: body.personaId,
    businessName: body.businessName ?? 'Meu Negócio',
    specialty: body.specialty,
    city: body.city,
    phone: body.phone,
  })

  // Build the hashtag list from the persona's strategy
  const allHashtags = [
    ...persona.hashtagStrategy.primary,
    ...persona.hashtagStrategy.secondary,
    ...persona.hashtagStrategy.niche,
  ].slice(0, 15)

  // Use Claude to personalise and enhance the bio
  const contextParts = [
    body.businessName && `Nome do negócio: ${body.businessName}`,
    body.specialty && `Especialidade: ${body.specialty}`,
    body.city && `Cidade: ${body.city}`,
    body.niche && `Nicho: ${body.niche}`,
    body.extraContext && `Contexto extra: ${body.extraContext}`,
  ].filter(Boolean).join('\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `Você é um especialista em growth de Instagram para negócios brasileiros.

Com base na persona de conteúdo abaixo, gere sugestões personalizadas de perfil para Instagram.

**Persona:** ${persona.emoji} ${persona.name}
**Estilo:** ${persona.contentTone}
**Bio base gerada:** ${bioBase}
**Dados do cliente:**
${contextParts || 'Não informado'}

Responda SOMENTE com JSON válido, sem markdown:

{
  "bio": "Bio final otimizada para o Instagram (máx 150 caracteres, com emojis e quebras de linha \\n)",
  "ctaOptions": ["CTA 1 para DM/WhatsApp", "CTA 2 para engajamento", "CTA 3 para seguir/salvar"],
  "postingSchedule": "Frequência e horários ideais de postagem em 1 frase"
}`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const json = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const aiResult = JSON.parse(json) as {
      bio?: string
      ctaOptions?: string[]
      postingSchedule?: string
    }

    const suggestion: ProfileSuggestion = {
      bio: aiResult.bio ?? bioBase,
      ctaOptions: aiResult.ctaOptions?.length ? aiResult.ctaOptions : persona.ctaOptions,
      hashtagsPost: allHashtags,
      contentPillars: persona.contentPillars,
      captionHooks: persona.captionHooks,
      postingSchedule: aiResult.postingSchedule ?? 'Poste 3-5x por semana, preferencialmente entre 18h-21h',
    }

    return NextResponse.json({ persona: { id: persona.id, name: persona.name, emoji: persona.emoji }, suggestion })
  } catch (e) {
    // Fallback to template-based suggestion without Claude
    const suggestion: ProfileSuggestion = {
      bio: bioBase,
      ctaOptions: persona.ctaOptions,
      hashtagsPost: allHashtags,
      contentPillars: persona.contentPillars,
      captionHooks: persona.captionHooks,
      postingSchedule: 'Poste 3-5x por semana, preferencialmente entre 18h-21h',
    }
    return NextResponse.json({ persona: { id: persona.id, name: persona.name, emoji: persona.emoji }, suggestion })
  }
}
