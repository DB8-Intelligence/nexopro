import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — lista contas Meta conectadas do tenant
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: connections, error: dbError } = await supabase
    .from('social_media_connections')
    .select('id, platform, account_id, account_name, account_username, account_avatar_url, is_active, connected_at')
    .eq('is_active', true)
    .order('connected_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ connections: connections ?? [] })
}

// DELETE — desconectar conta
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { connectionId } = await req.json() as { connectionId: string }

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId obrigatório' }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('social_media_connections')
    .update({ is_active: false })
    .eq('id', connectionId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
