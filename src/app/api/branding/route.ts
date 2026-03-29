import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const { data } = await supabase
    .from('tenant_settings')
    .select(`
      branding_completed, branding_about, branding_audience,
      branding_tone, branding_differential, branding_pain_point,
      branding_colors, branding_phrase
    `)
    .eq('tenant_id', profile.tenant_id)
    .single()

  return NextResponse.json(data ?? {})
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const body = await req.json()

  const { error } = await supabase
    .from('tenant_settings')
    .update({
      branding_completed:    true,
      branding_about:        body.about?.trim() || null,
      branding_audience:     body.audience?.trim() || null,
      branding_tone:         body.tone || null,
      branding_differential: body.differential?.trim() || null,
      branding_pain_point:   body.pain_point?.trim() || null,
      branding_colors:       body.colors?.trim() || null,
      branding_phrase:       body.phrase?.trim() || null,
      branding_updated_at:   new Date().toISOString(),
    })
    .eq('tenant_id', profile.tenant_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
