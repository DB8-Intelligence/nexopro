import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { requireTenant } from '@/modules/platform/tenants/tenant-context'

export async function POST(req: NextRequest) {
  // No original, user autenticado sem tenant caía no 404
  // "Nenhuma assinatura Stripe encontrada" pelo efeito colateral de
  // query com tenant_id vazio. Preserva essa mensagem via override.
  const ctx = await requireTenant({
    tenantMissingMessage: 'Nenhuma assinatura Stripe encontrada',
  })
  if (ctx instanceof NextResponse) return ctx

  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', ctx.tenantId)
    .single()

  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura Stripe encontrada' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id,
    return_url: `${appUrl}/assinatura`,
  })

  return NextResponse.json({ url: session.url })
}
