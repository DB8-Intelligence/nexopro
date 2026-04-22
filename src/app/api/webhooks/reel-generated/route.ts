// Callback do pipeline externo (n8n/Railway) quando um reel fica pronto.
//
// Body esperado:
//   {
//     project_id: string       — id do content_project criado pelo cron
//     video_url: string        — URL pública do MP4 já subido no Storage
//     thumbnail_url?: string   — (opcional) primeiro frame
//     job_id?: string          — (opcional) id do job no n8n, pra correlação
//     duration_sec?: number    — (opcional) duração real do vídeo
//     error?: string           — (opcional) se preenchido, marca como falha
//   }
//
// Segurança: header `x-webhook-token` precisa bater com N8N_WEBHOOK_TOKEN.
// Usa service role pra bypassar RLS (o n8n não tem sessão de user).
//
// Efeitos:
//   - content_project: status='scheduled' (se sucesso) ou 'error' (se erro).
//     generated_video_url preenchido.
//   - Se tenant tem Meta connection ativa: cria scheduled_post pro próximo
//     slot do schedule. Publisher cron publica como Reel no IG.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function nextSlotUtc(hour: number, timezone: string): Date {
  const nowUtc = new Date()
  const nowLocal = toZonedTime(nowUtc, timezone)
  const slotLocal = new Date(nowLocal)
  slotLocal.setHours(hour, 0, 0, 0)
  if (slotLocal.getTime() <= nowLocal.getTime()) {
    slotLocal.setDate(slotLocal.getDate() + 1)
  }
  return fromZonedTime(slotLocal, timezone)
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-webhook-token') ?? req.nextUrl.searchParams.get('token')
  if (!process.env.N8N_WEBHOOK_TOKEN || token !== process.env.N8N_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Invalid webhook token' }, { status: 401 })
  }

  const body = await req.json() as {
    project_id?:    string
    video_url?:     string
    thumbnail_url?: string
    job_id?:        string
    duration_sec?:  number
    error?:         string
  }

  if (!body.project_id) {
    return NextResponse.json({ error: 'project_id obrigatório' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: project } = await supabase
    .from('content_projects')
    .select('id, tenant_id, user_id, schedule_id, generated_caption, generated_hashtags, analysis')
    .eq('id', body.project_id)
    .maybeSingle()

  if (!project) return NextResponse.json({ error: 'Project não encontrado' }, { status: 404 })

  // Caso de erro: marca o projeto como falha e não cria scheduled_post.
  if (body.error || !body.video_url) {
    await supabase
      .from('content_projects')
      .update({
        status:           'error',
        generation_error: body.error ?? 'Callback sem video_url',
      })
      .eq('id', project.id)

    await supabase.from('notifications').insert({
      tenant_id:  project.tenant_id,
      profile_id: project.user_id,
      title:      'Falha ao gerar reel',
      message:    body.error ?? 'O pipeline não retornou um vídeo válido.',
      type:       'ia',
      link:       `/conteudo/${project.id}`,
    })

    return NextResponse.json({ ok: true, outcome: 'failed_recorded' })
  }

  // Sucesso: atualiza o project com a URL do vídeo.
  await supabase
    .from('content_projects')
    .update({
      status:               'scheduled',
      generated_video_url:  body.video_url,
      generation_job_id:    body.job_id ?? null,
      generation_error:     null,
    })
    .eq('id', project.id)

  // Se existe schedule + Meta connection ativa, cria scheduled_post pro próximo slot.
  let scheduledPostId: string | null = null
  if (project.schedule_id) {
    const { data: schedule } = await supabase
      .from('content_schedules')
      .select('hour_of_day, timezone')
      .eq('id', project.schedule_id)
      .maybeSingle()

    const { data: connection } = await supabase
      .from('social_media_connections')
      .select('id')
      .eq('tenant_id', project.tenant_id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (schedule && connection) {
      const slot = nextSlotUtc(schedule.hour_of_day, schedule.timezone)
      const caption = project.generated_caption ?? (project.analysis?.hook ?? '')
      const hashtags = project.generated_hashtags ?? []
      const fullCaption = hashtags.length ? `${caption}\n\n${hashtags.join(' ')}` : caption

      const { data: post } = await supabase
        .from('scheduled_posts')
        .insert({
          tenant_id:     project.tenant_id,
          user_id:       project.user_id,
          connection_id: connection.id,
          caption:       fullCaption,
          media_urls:    [body.video_url],
          media_type:    'reel',
          hashtags,
          status:        'scheduled',
          scheduled_for: slot.toISOString(),
        })
        .select('id')
        .single()

      scheduledPostId = post?.id ?? null
    }
  }

  await supabase.from('notifications').insert({
    tenant_id:  project.tenant_id,
    profile_id: project.user_id,
    title:      scheduledPostId ? 'Reel pronto e agendado' : 'Reel pronto',
    message:    scheduledPostId
      ? 'Seu reel foi renderizado e agendado pra publicação automática.'
      : 'Seu reel está pronto. Publique manualmente (conecte o Meta pra autopilot).',
    type:       'ia',
    link:       `/conteudo/${project.id}`,
  })

  return NextResponse.json({
    ok: true,
    projectId: project.id,
    scheduledPostId,
    videoUrl: body.video_url,
  })
}
