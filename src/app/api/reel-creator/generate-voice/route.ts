import { NextRequest, NextResponse } from 'next/server'
import { requireTenantWithRow } from '@/modules/platform/tenants/tenant-context'
import {
  FeatureNotAvailableError,
  RateLimitExceededError,
  guardAICall,
} from '@/modules/platform/ai-cost-control'

// OpenAI TTS voices available
export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

const VOICE_LABELS: Record<TTSVoice, string> = {
  alloy:   'Alloy (neutro)',
  echo:    'Echo (masculino)',
  fable:   'Fable (narrativo)',
  onyx:    'Onyx (grave)',
  nova:    'Nova (feminino)',
  shimmer: 'Shimmer (suave)',
}

// Quando SIMULATE_AI=true, devolvemos um buffer mínimo (sync MP3 frame).
// Não toca audio real, mas a rota retorna 200 com Content-Type: audio/mpeg
// preservando o contrato. Frontend que tenta tocar simplesmente falha
// silenciosamente — comportamento aceitável em modo simulação.
const SILENT_MP3_PLACEHOLDER = new Uint8Array([0xff, 0xfb, 0x00, 0x00])

export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICE_LABELS).map(([id, label]) => ({ id, label })),
  })
}

export async function POST(req: NextRequest) {
  const ctx = await requireTenantWithRow()
  if (ctx instanceof NextResponse) return ctx

  let simulate: boolean
  try {
    ;({ simulate } = await guardAICall({
      tenantId: ctx.tenantId,
      plan: ctx.tenant.plan,
      type: 'tts',
    }))
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return NextResponse.json({ error: 'Geração de voz não disponível no seu plano' }, { status: 403 })
    }
    if (err instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: `Limite diário de TTS atingido (${err.limit}/dia). Tente novamente mais tarde.` },
        { status: 429 },
      )
    }
    throw err
  }

  const { script, voice = 'nova', speed = 1.0 } = await req.json() as {
    script: string
    voice?: TTSVoice
    speed?: number
  }

  if (!script?.trim()) {
    return NextResponse.json({ error: 'Script obrigatório' }, { status: 400 })
  }

  if (simulate) {
    return new NextResponse(SILENT_MP3_PLACEHOLDER, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="narration-simulated.mp3"',
        'Cache-Control': 'no-store',
        'X-AI-Simulate': 'true',
      },
    })
  }

  const ttsKey = process.env.OPENAI_TTS_KEY
  if (!ttsKey) {
    return NextResponse.json({ error: 'OPENAI_TTS_KEY não configurada' }, { status: 500 })
  }

  // Truncate to ~4000 chars to stay within TTS limits (~5min audio)
  const text = script.trim().slice(0, 4000)

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ttsKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
        speed: Math.min(Math.max(speed, 0.25), 4.0),
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `OpenAI TTS: ${errText}` }, { status: 502 })
    }

    const audioBuffer = await res.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="narration.mp3"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro na geração de voz' },
      { status: 500 }
    )
  }
}
