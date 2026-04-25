import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { requireTenantWithRow } from '@/modules/platform/tenants/tenant-context'
import {
  FeatureNotAvailableError,
  RateLimitExceededError,
  guardAICall,
} from '@/modules/platform/ai-cost-control'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Platform detection ──────────────────────────────────────

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'unknown'

function detectPlatform(url: string): Platform {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook'
  if (/twitter\.com|x\.com/.test(url)) return 'twitter'
  return 'unknown'
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return m?.[1] ?? null
}

// ─── Metadata fetchers ───────────────────────────────────────

interface VideoMeta {
  title: string | null
  author: string | null
  thumbnailUrl: string | null
  duration: string | null
  description: string | null
}

async function fetchYoutubeMeta(url: string): Promise<{ meta: VideoMeta; frames: string[]; transcript: string }> {
  const videoId = extractYoutubeId(url)
  const frames: string[] = []
  let transcript = ''
  let meta: VideoMeta = { title: null, author: null, thumbnailUrl: null, duration: null, description: null }

  if (!videoId) return { meta, frames, transcript }

  // oEmbed for title + author
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 0 } }
    )
    if (oembed.ok) {
      const d = await oembed.json() as { title?: string; author_name?: string; thumbnail_url?: string }
      meta.title = d.title ?? null
      meta.author = d.author_name ?? null
      meta.thumbnailUrl = d.thumbnail_url ?? null
    }
  } catch { /* ignore */ }

  // YouTube public thumbnail frames (free, no API key)
  // 0=cover, 1=25%, 2=50%, 3=75% of video
  const frameUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/1.jpg`,
    `https://img.youtube.com/vi/${videoId}/2.jpg`,
    `https://img.youtube.com/vi/${videoId}/3.jpg`,
  ]

  for (const frameUrl of frameUrls) {
    try {
      const res = await fetch(frameUrl, { next: { revalidate: 0 } })
      if (res.ok && res.headers.get('content-type')?.startsWith('image')) {
        const buf = await res.arrayBuffer()
        const b64 = Buffer.from(buf).toString('base64')
        // Validate it's not a placeholder (YouTube returns 120x90 placeholder for missing frames)
        if (buf.byteLength > 5000) {
          frames.push(b64)
        }
      }
    } catch { /* ignore */ }
  }

  // Try to get captions (Portuguese or English)
  for (const lang of ['pt', 'en', 'pt-BR']) {
    try {
      const captionUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=json3`
      const captionRes = await fetch(captionUrl, { next: { revalidate: 0 } })
      if (captionRes.ok) {
        interface CaptionEvent { segs?: Array<{ utf8?: string }> }
        interface CaptionData { events?: CaptionEvent[] }
        const captionData = await captionRes.json() as CaptionData
        if (captionData?.events?.length) {
          transcript = captionData.events
            .flatMap((e: CaptionEvent) => e.segs ?? [])
            .map((s) => s.utf8 ?? '')
            .join(' ')
            .replace(/\n/g, ' ')
            .trim()
          if (transcript.length > 50) break
        }
      }
    } catch { /* ignore */ }
  }

  return { meta, frames, transcript }
}

async function fetchOembedMeta(url: string, platform: Platform): Promise<VideoMeta> {
  const endpoints: Record<string, string> = {
    instagram: 'https://graph.instagram.com/oembed',
    tiktok: 'https://www.tiktok.com/oembed',
    facebook: 'https://www.facebook.com/plugins/video/oembed.json',
  }

  const endpoint = endpoints[platform]
  if (!endpoint) return { title: null, author: null, thumbnailUrl: null, duration: null, description: null }

  try {
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, { next: { revalidate: 0 } })
    if (res.ok) {
      const d = await res.json() as {
        title?: string; author_name?: string; thumbnail_url?: string
      }
      return {
        title: d.title ?? null,
        author: d.author_name ?? null,
        thumbnailUrl: d.thumbnail_url ?? null,
        duration: null,
        description: null,
      }
    }
  } catch { /* ignore */ }

  return { title: null, author: null, thumbnailUrl: null, duration: null, description: null }
}

// Fetch a thumbnail image as base64
async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { next: { revalidate: 0 } })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength < 3000) return null
    return Buffer.from(buf).toString('base64')
  } catch {
    return null
  }
}

// ─── Build analysis prompt ───────────────────────────────────

function buildAnalysisPrompt(params: {
  platform: Platform
  url: string
  meta: VideoMeta
  transcript: string
  niche: string
  hasFrames: boolean
}): string {
  const { platform, url, meta, transcript, niche, hasFrames } = params

  const platformLabel: Record<Platform, string> = {
    youtube: 'YouTube / Shorts',
    instagram: 'Instagram Reel',
    tiktok: 'TikTok',
    facebook: 'Facebook Reel',
    twitter: 'X/Twitter',
    unknown: 'Vídeo',
  }

  return `Você é um especialista em análise de conteúdo viral para redes sociais brasileiras.
Analise este vídeo${hasFrames ? ' usando os frames fornecidos' : ' baseado nas informações disponíveis'} e gere uma análise completa + roteiro recriado.

## DADOS DO VÍDEO
- Plataforma: ${platformLabel[platform]}
- URL: ${url}
- Título: ${meta.title ?? '(não disponível)'}
- Criador/Canal: ${meta.author ?? '(não disponível)'}
- Nicho do usuário: ${niche || 'geral'}

${transcript ? `## TRANSCRIÇÃO DO ÁUDIO\n${transcript.slice(0, 2000)}\n` : ''}
${!transcript && !hasFrames ? `## NOTA\nNão foi possível extrair frames ou transcrição deste vídeo. Faça a análise baseada no que você sabe sobre o formato deste tipo de conteúdo e no nicho do usuário.\n` : ''}

## ANÁLISE SOLICITADA

Gere a análise completa no seguinte formato:

## 🔍 ANÁLISE DO REEL

### Dados Gerais
- Plataforma: ${platformLabel[platform]}
- Nicho identificado: [nicho detectado nos frames/texto ou ${niche}]
- Tom de voz: [formal/informal/energético/didático/emocional]
- Duração estimada: [Xs] (baseado na estrutura)
- Pontuação de Viralidade: [X/100] com justificativa breve

### Hook (0-3s)
- Tipo: [curiosidade/dado chocante/controvérsia/POV/lista]
- Texto do gancho: "[texto exato ou reconstituído]"
- Efetividade (1-10): [nota]
- Por que funciona: [análise em 1-2 linhas]

### Estrutura Cena a Cena
[CENA 1] 0-2s — HOOK
Visual: [o que aparece]
Texto na tela: "[texto]"
Técnica: [o que torna eficaz]

[CENA 2] 2-5s — PROMESSA
...

[CENA 3-N] 5-30s — ENTREGA
...

[CENA FINAL] 30-38s — CTA
...

### Elementos Virais Identificados
- [elemento 1]: [descrição + por que funciona]
- [elemento 2]: ...

### Pontos Fortes
1. [ponto específico]
2. [ponto específico]
3. [ponto específico]

### Oportunidades de Melhoria
1. [melhoria concreta]
2. [melhoria concreta]

---

## 🎬 ROTEIRO RECRIADO — ${niche.toUpperCase() || 'SEU NICHO'}

Recrie o conteúdo adaptado ao nicho "${niche || 'do usuário'}", mantendo a estrutura viral identificada mas com tema e exemplos relevantes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 ROTEIRO: [TÍTULO ADAPTADO]
Nicho: ${niche || '[definir]'} | Formato: Reel | Duração: [Xs]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CENA 1] 0-2s — HOOK
Visual: [descrição]
Texto na tela: "[máx 6 palavras]"
Voz: "[gancho falado em 2s]"
Prompt AI (imagem): "[English prompt, 9:16, cinematic]"

[CENA 2] 2-5s — PROMESSA
Visual: [...]
Voz: "[...]"

[CENAS 3-N] 5-30s — ENTREGA
...

[CENA FINAL] 30-38s — CTA
Visual: [...]
Voz: "[CTA falado]"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📱 TEXTO DO POST (adaptado)
[legenda completa com emojis, parágrafos curtos e CTA]

## 🏷️ HASHTAGS SUGERIDAS
[25 hashtags em 3 grupos: grande/média/nicho]

## 💡 DIFERENCIAIS PARA SUPERAR O ORIGINAL
1. [diferencial específico]
2. [diferencial específico]
3. [diferencial específico]`
}

// ─── Main route ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ctx = await requireTenantWithRow({ unauthorizedMessage: 'Unauthorized' })
  if (ctx instanceof NextResponse) return ctx

  const plan = ctx.tenant.plan
  const tenantNiche = ctx.tenant.niche

  // Plan gate específico desta rota: pro e superior
  if (['trial', 'starter'].includes(plan)) {
    return NextResponse.json(
      { error: 'Esta funcionalidade requer o plano Pro ou superior.' },
      { status: 403 }
    )
  }

  // Cost control: rate limit + simulate
  let simulate: boolean
  try {
    ;({ simulate } = await guardAICall({
      tenantId: ctx.tenantId,
      plan: ctx.tenant.plan,
      type: 'text',
    }))
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return NextResponse.json({ error: 'Análise de vídeo não disponível no seu plano' }, { status: 403 })
    }
    if (err instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: `Limite diário de análise atingido (${err.limit}/dia). Tente novamente mais tarde.` },
        { status: 429 },
      )
    }
    throw err
  }

  const supabase = await createClient()

  // Parse body — supports JSON (URL) or multipart (file upload)
  let url = ''
  let userNiche = tenantNiche
  let uploadedFrames: string[] = []

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    url = (formData.get('url') as string) ?? ''
    userNiche = (formData.get('niche') as string) || tenantNiche

    // Handle file upload
    const file = formData.get('file') as File | null
    if (file && file.type.startsWith('video/')) {
      // For uploaded video, call db8-agent for frame extraction if available
      const db8Url = process.env.DB8_AGENT_URL
      if (db8Url) {
        try {
          const uploadForm = new FormData()
          uploadForm.append('video', file)
          uploadForm.append('n_frames', '8')

          const extractRes = await fetch(`${db8Url}/extract-frames`, {
            method: 'POST',
            body: uploadForm,
          })
          if (extractRes.ok) {
            const extractData = await extractRes.json() as { frames?: string[] }
            uploadedFrames = extractData.frames ?? []
          }
        } catch { /* db8-agent may not have this endpoint yet */ }
      }

      if (!url) url = `upload://${file.name}`
    }
  } else {
    const body = await req.json() as { url?: string; niche?: string }
    url = body.url ?? ''
    userNiche = body.niche || tenantNiche
  }

  if (!url || url === 'upload://') {
    return NextResponse.json({ error: 'URL ou arquivo de vídeo obrigatório' }, { status: 400 })
  }

  // ── Simulate mode: bypass toda a pipeline (frame extract + Anthropic) ──
  if (simulate) {
    const encoder = new TextEncoder()
    const simulatedStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(
          '# Análise de vídeo (modo simulação)\n\n' +
          '**SIMULATE_AI=true** — chamadas externas (frame extraction + Anthropic) ignoradas para controle de custo.\n\n' +
          '## Hook\nSimulação de hook viral.\n\n' +
          '## Pacing\nSimulação de pacing.\n\n' +
          '## CTA\nSimulação de CTA.\n',
        ))
        controller.close()
      },
    })
    return new NextResponse(simulatedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Platform': 'simulate',
        'X-Has-Frames': 'false',
        'X-AI-Simulate': 'true',
      },
    })
  }

  // ── Detect platform and extract metadata ──
  const platform = url.startsWith('upload://') ? 'unknown' : detectPlatform(url)
  let meta: VideoMeta = { title: null, author: null, thumbnailUrl: null, duration: null, description: null }
  let frames: string[] = uploadedFrames
  let transcript = ''

  if (platform === 'youtube' && !url.startsWith('upload://')) {
    const yt = await fetchYoutubeMeta(url)
    meta = yt.meta
    frames = [...frames, ...yt.frames]
    transcript = yt.transcript
  } else if (['instagram', 'tiktok', 'facebook'].includes(platform)) {
    meta = await fetchOembedMeta(url, platform)

    // Try to get the thumbnail as a frame
    if (meta.thumbnailUrl) {
      const b64 = await fetchImageAsBase64(meta.thumbnailUrl)
      if (b64) frames = [b64, ...frames]
    }
  }

  // ── Stream analysis from Claude ──
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text))

      try {
        // Build image content blocks for Claude Vision
        const imageBlocks: Anthropic.ImageBlockParam[] = frames
          .slice(0, 6) // max 6 frames to control cost
          .map(b64 => ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: 'image/jpeg' as const,
              data: b64,
            },
          }))

        const hasFrames = imageBlocks.length > 0
        const promptText = buildAnalysisPrompt({ platform, url, meta, transcript, niche: userNiche, hasFrames })

        const messages: Anthropic.MessageParam[] = [
          {
            role: 'user',
            content: hasFrames
              ? [
                  ...imageBlocks,
                  { type: 'text' as const, text: promptText },
                ]
              : promptText,
          },
        ]

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          stream: true,
          messages,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send(event.delta.text)
          }
        }
      } catch (err) {
        send(`\n\n**Erro na análise:** ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Platform': platform,
      'X-Has-Frames': frames.length > 0 ? 'true' : 'false',
      'X-Video-Title': encodeURIComponent(meta.title ?? ''),
    },
  })
}
