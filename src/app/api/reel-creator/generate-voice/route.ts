import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICE_LABELS).map(([id, label]) => ({ id, label })),
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const ttsKey = process.env.OPENAI_TTS_KEY
  if (!ttsKey) {
    return NextResponse.json({ error: 'OPENAI_TTS_KEY não configurada' }, { status: 500 })
  }

  const { script, voice = 'nova', speed = 1.0 } = await req.json() as {
    script: string
    voice?: TTSVoice
    speed?: number
  }

  if (!script?.trim()) {
    return NextResponse.json({ error: 'Script obrigatório' }, { status: 400 })
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

    // Stream the mp3 binary back to the client
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
