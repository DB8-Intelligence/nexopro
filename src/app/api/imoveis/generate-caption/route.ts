import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db8Fetch } from '@/lib/db8-agent'

interface CaptionRequest {
  property_id: string
  title?: string
  description?: string
  price?: string
  city?: string
  neighborhood?: string
  highlights?: string
  property_type?: string
}

interface CaptionResponse {
  caption: string
  post_text: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json() as CaptionRequest

  if (!body.property_id) {
    return NextResponse.json({ error: 'property_id obrigatório' }, { status: 400 })
  }

  // Verifica se o imóvel pertence ao tenant do usuário (RLS garante, mas validamos explicitamente)
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id, tenant_id')
    .eq('id', body.property_id)
    .single()

  if (propError || !property) {
    return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
  }

  try {
    const result = await db8Fetch<CaptionResponse>('/generate-caption', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    // Salva o caption gerado no Supabase
    await supabase
      .from('properties')
      .update({
        generated_caption: result.caption,
        generated_post_text: result.post_text,
        status: 'caption_ready',
      })
      .eq('id', body.property_id)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar legenda'
    await supabase
      .from('properties')
      .update({ status: 'error', error_message: message })
      .eq('id', body.property_id)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
