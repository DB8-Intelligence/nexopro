/**
 * Stripe webhook endpoint.
 *
 * Responsabilidades desta rota:
 *   1. Ler o raw body + header `stripe-signature`
 *   2. Validar assinatura via `stripe.webhooks.constructEvent`
 *   3. Resolver objetos secundários via SDK quando necessário (ex: subscription
 *      completa do `checkout.session.completed`)
 *   4. Despachar dados já normalizados para o use case correspondente
 *   5. Retornar 200 { received: true }
 *
 * Side effects de negócio (update de tenant, envio de email) vivem em
 * `src/modules/billing/application/handle-*.ts`. O SDK do Stripe e a
 * verificação de assinatura são INTENCIONALMENTE infra desta rota —
 * protocolos de webhook são provider-específicos. Ver ADR-0002.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { handleCheckoutSessionCompleted } from '@/modules/billing/application/handle-checkout-session-completed'
import { handleSubscriptionUpdated } from '@/modules/billing/application/handle-subscription-updated'
import { handleSubscriptionDeleted } from '@/modules/billing/application/handle-subscription-deleted'
import { handleInvoicePaymentFailed } from '@/modules/billing/application/handle-invoice-payment-failed'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenant_id
      const plan = session.metadata?.plan
      if (!tenantId || !plan) break

      const sub = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null

      await handleCheckoutSessionCompleted({
        tenantId,
        plan,
        subscription: sub
          ? {
              id: sub.id,
              priceId: sub.items.data[0]?.price.id ?? null,
              cancelAt: sub.cancel_at,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            }
          : null,
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenant_id
      if (!tenantId) break

      await handleSubscriptionUpdated({
        tenantId,
        priceId: sub.items.data[0]?.price.id ?? null,
        cancelAt: sub.cancel_at,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenant_id
      if (!tenantId) break

      await handleSubscriptionDeleted({ tenantId })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId =
        typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (!customerId) break

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      await handleInvoicePaymentFailed({ customerId, appUrl })
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
