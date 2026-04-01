import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db8Upload } from '@/lib/db8-agent'

interface VideoResponse {
  job_id: string
  status: string
  message?: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Recebe o FormData do cliente (imagens + property_id)
  const formData = await req.formData()
  const propertyId = formData.get('property_id')?.toString()

  if (!propertyId) {
    return NextResponse.json({ error: 'property_id obrigatório' }, { status: 400 })
  }

  // Verifica ownership via RLS
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .single()

  if (propError || !property) {
    return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
  }

  // Atualiza status para processando
  await supabase
    .from('properties')
    .update({ status: 'video_processing' })
    .eq('id', propertyId)

  try {
    // Repassa o FormData inteiro para o db8-agent (ele cuida do FFmpeg)
    const result = await db8Upload<VideoResponse>('/generate-video', formData)

    // Salva o job_id do db8-agent para rastreamento via n8n webhook
    if (result.job_id) {
      await supabase
        .from('properties')
        .update({ db8_agent_id: result.job_id })
        .eq('id', propertyId)
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao iniciar geração de vídeo'
    await supabase
      .from('properties')
      .update({ status: 'error', error_message: message })
      .eq('id', propertyId)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
