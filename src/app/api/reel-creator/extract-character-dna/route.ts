import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Allowed domains for fetching character images (same whitelist as proxy-asset)
const ALLOWED_HOSTS = [
  'v3.fal.media',
  'fal.media',
  'storage.googleapis.com',
  'cdn.fal.ai',
]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { imageUrl } = await req.json() as { imageUrl?: string }
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl obrigatório' }, { status: 400 })

  // SSRF guard
  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }
  if (!ALLOWED_HOSTS.some(h => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`))) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 })
  }

  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
    if (!imgRes.ok) return NextResponse.json({ error: 'Falha ao buscar imagem' }, { status: 502 })

    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    const mediaType = contentType.includes('png') ? 'image/png'
      : contentType.includes('webp') ? 'image/webp'
      : 'image/jpeg'

    const buffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Extract a precise character DNA description from this Pixar/Disney 3D character image.

Return ONLY a single English description (2-3 sentences, no JSON, no markdown, no labels) usable as a Stable Diffusion/Flux prompt prefix to reproduce this EXACT character in different scenes.

Cover: object type, exact colors & materials, facial expression style, eye design, body proportions, render quality.
Example output format: "A cheerful 3D animated golden scissors character in Pixar Disney style, shiny chrome blades with rose-gold accents, big round expressive eyes positioned on the pivot point, wide friendly smile, soft studio lighting, subsurface scattering, 8K render"`,
          },
        ],
      }],
    })

    const dna = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    if (!dna) return NextResponse.json({ error: 'DNA não extraído' }, { status: 500 })

    return NextResponse.json({ dna })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Falha na extração' },
      { status: 500 }
    )
  }
}
