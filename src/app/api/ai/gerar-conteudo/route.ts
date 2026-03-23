import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { AI_CONFIG, buildSocialContentPrompt } from '@/lib/ai'
import type { ContentType } from '@/types/database'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GenerateContentRequest {
  contentType: ContentType
  topic?: string
  tone?: 'profissional' | 'descontraido' | 'educativo'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenants(name, niche, plan)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
  }

  // Verificar plano
  if (tenant.plan === 'trial' || tenant.plan === 'starter') {
    return NextResponse.json(
      { error: 'Recurso disponível a partir do plano Pro' },
      { status: 403 }
    )
  }

  const body = await request.json() as GenerateContentRequest

  const prompt = buildSocialContentPrompt({
    niche: tenant.niche,
    businessName: tenant.name,
    contentType: body.contentType,
    topic: body.topic,
    tone: body.tone,
  })

  try {
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokensDefault,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 })
    }

    // Parse JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Formato de resposta inválido' }, { status: 500 })
    }

    const generated = JSON.parse(jsonMatch[0])
    return NextResponse.json(generated)
  } catch (err) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: 'Erro ao gerar conteúdo' }, { status: 500 })
  }
}
