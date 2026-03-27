import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTalkingObjectsForNiche } from '@/lib/content-ai/talking-objects'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const nicho = req.nextUrl.searchParams.get('nicho') ?? 'tecnico'
  const objects = getTalkingObjectsForNiche(nicho)
  return NextResponse.json({ objects })
}
