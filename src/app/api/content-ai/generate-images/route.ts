import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentScene } from '@/types/database'

interface GeneratedImage {
  scene_id: number
  url: string
  prompt: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 503 })
  }

  const { project_id } = await req.json() as { project_id: string }
  if (!project_id) return NextResponse.json({ error: 'project_id obrigatório' }, { status: 400 })

  const { data: project, error: projError } = await supabase
    .from('content_projects')
    .select('id, generated_scenes')
    .eq('id', project_id)
    .single()

  if (projError || !project) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
  }

  const scenes = (project.generated_scenes ?? []) as ContentScene[]
  if (scenes.length === 0) {
    return NextResponse.json({ error: 'Nenhuma cena encontrada. Execute a análise primeiro.' }, { status: 400 })
  }

  await supabase
    .from('content_projects')
    .update({ status: 'generating_images' })
    .eq('id', project_id)

  try {
    const generatedImages: GeneratedImage[] = []

    for (const scene of scenes) {
      const prompt = scene.image_prompt ?? scene.description
      const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_size: 'portrait_4_3',
          num_inference_steps: 4,
          num_images: 1,
        }),
      })

      if (res.ok) {
        const data = await res.json() as { images?: Array<{ url: string }> }
        const url = data.images?.[0]?.url ?? ''
        if (url) generatedImages.push({ scene_id: scene.id, url, prompt })
      }
    }

    await supabase
      .from('content_projects')
      .update({
        status: 'configuring',
        generated_images: generatedImages,
      })
      .eq('id', project_id)

    return NextResponse.json({ images: generatedImages })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar imagens'
    await supabase
      .from('content_projects')
      .update({ status: 'error' })
      .eq('id', project_id)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
