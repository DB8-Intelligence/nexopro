import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Webhook do n8n — recebe callbacks do db8-agent após processamento de vídeo.
 * Eventos: video_completed | video_failed | creative_ready | new_user
 */

interface N8nWebhookPayload {
  event: 'video_completed' | 'video_failed' | 'creative_ready' | 'new_user'
  job_id?: string
  property_id?: string
  video_url?: string
  error?: string
  data?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  // Validação simples de segurança (token no header ou query)
  const token = req.nextUrl.searchParams.get('token') ?? req.headers.get('x-webhook-token')
  if (token !== process.env.N8N_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await req.json() as N8nWebhookPayload
  const supabase = await createServiceClient()

  switch (payload.event) {
    case 'video_completed': {
      if (payload.property_id && payload.video_url) {
        await supabase
          .from('properties')
          .update({ generated_video_url: payload.video_url, status: 'ready' })
          .eq('id', payload.property_id)
      } else if (payload.job_id && payload.video_url) {
        await supabase
          .from('properties')
          .update({ generated_video_url: payload.video_url, status: 'ready' })
          .eq('db8_agent_id', payload.job_id)
      }
      break
    }

    case 'video_failed': {
      const errorMsg = payload.error ?? 'Falha na geração do vídeo'
      if (payload.property_id) {
        await supabase
          .from('properties')
          .update({ status: 'error', error_message: errorMsg })
          .eq('id', payload.property_id)
      } else if (payload.job_id) {
        await supabase
          .from('properties')
          .update({ status: 'error', error_message: errorMsg })
          .eq('db8_agent_id', payload.job_id)
      }
      break
    }

    case 'creative_ready': {
      // Futuro: notificar tenant via realtime ou notification table
      break
    }

    default:
      break
  }

  return NextResponse.json({ ok: true })
}
