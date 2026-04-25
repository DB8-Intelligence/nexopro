import { NextRequest, NextResponse } from 'next/server'
import { requireTenantWithRow } from '@/modules/platform/tenants/tenant-context'
import {
  FeatureNotAvailableError,
  RateLimitExceededError,
  guardAICall,
  mockImageUrl,
} from '@/modules/platform/ai-cost-control'

interface FalResponse {
  images: { url: string; width: number; height: number; content_type: string }[]
  seed: number
}

export async function POST(req: NextRequest) {
  const ctx = await requireTenantWithRow()
  if (ctx instanceof NextResponse) return ctx

  let simulate: boolean
  try {
    ;({ simulate } = await guardAICall({
      tenantId: ctx.tenantId,
      plan: ctx.tenant.plan,
      type: 'image',
    }))
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return NextResponse.json({ error: 'Geração de imagens não disponível no seu plano' }, { status: 403 })
    }
    if (err instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: `Limite diário de imagens atingido (${err.limit}/dia). Tente novamente mais tarde.` },
        { status: 429 },
      )
    }
    throw err
  }

  const { prompt, scene, characterDna } = await req.json() as {
    prompt: string
    scene?: number
    characterDna?: string
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 })
  }

  if (simulate) {
    return NextResponse.json({ url: mockImageUrl(576, 1024), seed: 0, scene })
  }

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
        image_size: { width: 576, height: 1024 },
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
