import { NextRequest, NextResponse } from 'next/server'
import { requireTenantWithRow } from '@/modules/platform/tenants/tenant-context'
import {
  FeatureNotAvailableError,
  RateLimitExceededError,
  guardAICall,
  mockImageUrl,
} from '@/modules/platform/ai-cost-control'

interface FalResponse {
  images: { url: string }[]
}

interface CharacterImage {
  url: string | null
  error: string | null
}

async function generateOne(prompt: string, falKey: string): Promise<CharacterImage> {
  try {
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt}, isolated on clean gradient background, no text, no watermark`,
        image_size: { width: 576, height: 1024 },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
        sync_mode: true,
      }),
    })

    if (!res.ok) {
      return { url: null, error: `Fal.ai ${res.status}` }
    }

    const data = await res.json() as FalResponse
    return { url: data.images?.[0]?.url ?? null, error: null }
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : 'Erro' }
  }
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

  const { prompts } = await req.json() as { prompts: string[] }

  if (!prompts?.length || prompts.length > 6) {
    return NextResponse.json({ error: 'Envie 1–6 prompts.' }, { status: 400 })
  }

  if (simulate) {
    const images = prompts.map(() => ({ url: mockImageUrl(576, 1024), error: null }))
    return NextResponse.json({ images })
  }

  const falKey = process.env.FAL_KEY
  if (!falKey) return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 500 })

  const images = await Promise.all(prompts.map(p => generateOne(p, falKey)))

  return NextResponse.json({ images })
}
