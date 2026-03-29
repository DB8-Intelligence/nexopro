import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const META_APP_ID = process.env.META_APP_ID!
const META_APP_SECRET = process.env.META_APP_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`
const DASHBOARD_URL = `${process.env.NEXT_PUBLIC_APP_URL}/redes-sociais`

interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface MetaPageInfo {
  id: string
  name: string
  access_token: string
  instagram_business_account?: {
    id: string
    name: string
    username: string
    profile_picture_url?: string
  }
}

interface MetaPagesResponse {
  data: MetaPageInfo[]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Erro retornado pelo Facebook
  if (error) {
    const errorDesc = searchParams.get('error_description') ?? 'Conexão negada'
    return NextResponse.redirect(`${DASHBOARD_URL}?meta_error=${encodeURIComponent(errorDesc)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${DASHBOARD_URL}?meta_error=Parâmetros inválidos`)
  }

  // Decodificar state
  let stateData: { userId: string; tenantId: string; ts: number }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${DASHBOARD_URL}?meta_error=State inválido`)
  }

  // Validar timestamp (15 minutos)
  if (Date.now() - stateData.ts > 15 * 60 * 1000) {
    return NextResponse.redirect(`${DASHBOARD_URL}?meta_error=Sessão expirada. Tente novamente.`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== stateData.userId) {
    return NextResponse.redirect(`${DASHBOARD_URL}?meta_error=Usuário inválido`)
  }

  try {
    // 1. Trocar code por access token de usuário
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${META_APP_SECRET}&code=${code}`
    )
    const tokenData: MetaTokenResponse = await tokenRes.json()

    if (!tokenData.access_token) {
      throw new Error('Falha ao obter access token')
    }

    // 2. Trocar por long-lived token
    const llRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&client_id=${META_APP_ID}` +
      `&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    )
    const llData: MetaTokenResponse = await llRes.json()
    const longLivedToken = llData.access_token ?? tokenData.access_token

    // Calcular expiração (60 dias para long-lived)
    const expiresAt = llData.expires_in
      ? new Date(Date.now() + llData.expires_in * 1000).toISOString()
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()

    // 3. Buscar Pages vinculadas e seus Instagram Business Accounts
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?` +
      `fields=id,name,access_token,instagram_business_account{id,name,username,profile_picture_url}` +
      `&access_token=${longLivedToken}`
    )
    const pagesData: MetaPagesResponse = await pagesRes.json()

    if (!pagesData.data?.length) {
      return NextResponse.redirect(
        `${DASHBOARD_URL}?meta_error=Nenhuma Page do Facebook encontrada. Verifique se você é admin de uma Página.`
      )
    }

    // 4. Salvar conexões no banco
    const connections: Array<{
      tenant_id: string
      user_id: string
      platform: string
      account_id: string
      account_name: string | null
      account_username: string | null
      account_avatar_url: string | null
      access_token: string
      token_expires_at: string
      page_access_token: string | null
    }> = []

    for (const page of pagesData.data) {
      // Facebook Page connection
      connections.push({
        tenant_id: stateData.tenantId,
        user_id: user.id,
        platform: 'facebook',
        account_id: page.id,
        account_name: page.name,
        account_username: null,
        account_avatar_url: null,
        access_token: longLivedToken,
        token_expires_at: expiresAt,
        page_access_token: page.access_token,
      })

      // Instagram Business Account (se vinculado à Page)
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account
        connections.push({
          tenant_id: stateData.tenantId,
          user_id: user.id,
          platform: 'instagram',
          account_id: ig.id,
          account_name: ig.name ?? null,
          account_username: ig.username ?? null,
          account_avatar_url: ig.profile_picture_url ?? null,
          access_token: page.access_token,   // Instagram usa o page token
          token_expires_at: expiresAt,
          page_access_token: page.access_token,
        })
      }
    }

    // Upsert (atualiza se já existe)
    for (const conn of connections) {
      await supabase
        .from('social_media_connections')
        .upsert(conn, { onConflict: 'tenant_id,platform,account_id' })
    }

    const igCount = connections.filter(c => c.platform === 'instagram').length
    const fbCount = connections.filter(c => c.platform === 'facebook').length

    return NextResponse.redirect(
      `${DASHBOARD_URL}?meta_success=${encodeURIComponent(
        `Conectado! ${igCount} conta(s) Instagram e ${fbCount} Page(s) Facebook vinculadas.`
      )}`
    )
  } catch (err) {
    console.error('[meta/callback] error:', err)
    return NextResponse.redirect(
      `${DASHBOARD_URL}?meta_error=Erro ao conectar conta. Tente novamente.`
    )
  }
}
