import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FalResponse {
  images: { url: string; width: number; height: number; content_type: string }[]
  seed: number
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { prompt, scene, characterDna } = await req.json() as {
    prompt: string
    scene?: number
    characterDna?: string
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 })
  }

  // Prepend character DNA so all scene images share the same character
  const finalPrompt = characterDna?.trim()
    ? `${characterDna.trim()}, ${prompt.trim()}`
    : prompt.trim()

  const falKey = process.env.FAL_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 500 })
  }

  try {
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        image_size: { width: 576, height: 1024 }, // 9:16 vertical
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
        sync_mode: true,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Fal.ai: ${errText}` }, { status: 502 })
    }

    const data = await res.json() as FalResponse

    return NextResponse.json({
      url: data.images[0]?.url ?? null,
      seed: data.seed,
      scene,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro na geração' },
      { status: 500 }
    )
  }
}
