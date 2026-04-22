// Dispara um job de geração de reel pro workflow externo (n8n/Railway).
//
// O workflow recebe o briefing completo (cenas, caption, duração, branding)
// e orquestra de forma async:
//   1. Para cada cena → POST /api/reel-creator/generate-image (Fal.ai)
//   2. POST /api/reel-creator/generate-voice (OpenAI TTS) com o roteiro
//   3. FFmpeg assembly no Railway (db8-agent já tem ffmpeg persistente)
//   4. Upload do MP4 pro Supabase Storage
//   5. POST callback → /api/webhooks/reel-generated com {project_id, video_url, job_id}
//
// Se N8N_REEL_GENERATION_WEBHOOK não está configurado, a função retorna
// um "configured: false" — cron vai tratar como fila pendente (project
// fica em status='generating_video' até alguém processar manualmente
// ou configurar o webhook).

export interface ReelBriefing {
  project_id:   string
  tenant_id:    string
  caption:      string
  hashtags:     string[]
  duration_sec: number
  scenes:       Array<{
    id:           number
    description:  string
    duration_sec: number
    image_prompt: string
  }>
  voice_script: string
  character_dna?:  string | null
  branding?: {
    tone?:       string | null
    colors?:     string | null
    differential?: string | null
  }
}

export interface DispatchResult {
  configured: boolean
  job_id?:    string
  error?:     string
}

export async function dispatchReelGeneration(
  briefing: ReelBriefing,
  callbackUrl: string,
): Promise<DispatchResult> {
  const webhook = process.env.N8N_REEL_GENERATION_WEBHOOK
  const token   = process.env.N8N_WEBHOOK_TOKEN

  if (!webhook) {
    return { configured: false, error: 'N8N_REEL_GENERATION_WEBHOOK não configurado' }
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        ...(token ? { 'x-webhook-token': token } : {}),
      },
      body: JSON.stringify({
        ...briefing,
        callback_url: callbackUrl,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { configured: true, error: `n8n responded ${res.status}: ${text.slice(0, 200)}` }
    }

    const data = await res.json().catch(() => ({})) as { job_id?: string; id?: string }
    return { configured: true, job_id: data.job_id ?? data.id }
  } catch (err) {
    return { configured: true, error: err instanceof Error ? err.message : String(err) }
  }
}

// URL absoluta do callback — o n8n precisa chamá-la quando o reel fica pronto.
export function reelCallbackUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://nexoomnix.com'
  return `${base}/api/webhooks/reel-generated`
}
