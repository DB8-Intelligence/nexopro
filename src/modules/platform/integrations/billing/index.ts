import type { BillingProvider } from './billing-provider'
import { StripeBillingProvider } from './stripe-adapter'

/**
 * Factory lazy + singleton. Hoje só há um provedor (Stripe).
 * Quando houver mais (Kiwify, etc.), o select pode vir de env var.
 */
let instance: BillingProvider | null = null

export function getBillingProvider(): BillingProvider {
  if (instance) return instance
  instance = new StripeBillingProvider()
  return instance
}

export type {
  BillingCheckoutSession,
  BillingCustomer,
  BillingProvider,
  CreateCheckoutSessionInput,
  CreateCustomerInput,
} from './billing-provider'
