import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const META_APP_ID = process.env.META_APP_ID!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`

// Scopes necessários para Instagram + Facebook publishing
const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
].join(',')

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar se tenant tem plano PRO MAX
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenants(plan)')
    .eq('id', user.id)
    .single()

  const plan = (profile?.tenants as { plan?: string } | null)?.plan
  if (!plan || !['pro_max', 'enterprise'].includes(plan)) {
    return NextResponse.json(
      { error: 'Esta funcionalidade requer o plano PRO MAX ou superior.' },
      { status: 403 }
    )
  }

  // Gerar state para proteção CSRF
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    tenantId: profile?.tenant_id,
    ts: Date.now(),
  })).toString('base64url')

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', META_APP_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('scope', SCOPES)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
