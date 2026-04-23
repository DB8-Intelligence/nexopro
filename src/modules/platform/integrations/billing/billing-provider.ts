/**
 * Contract de billing — mantido intencionalmente pequeno.
 *
 * Cobre APENAS as operações usadas pela rota /api/stripe/create-checkout
 * (única consumidora nesta sprint). Outros casos de uso (billing portal,
 * cancel subscription, resumir assinatura) serão adicionados à interface
 * em sprints futuras, quando houver uma rota real exigindo.
 *
 * O contract é agnóstico ao provedor: adapters concretos (Stripe hoje,
 * potencialmente Kiwify/Pagar.me amanhã) implementam esta interface.
 */

export interface CreateCustomerInput {
  /** Email do pagador. Opcional no Stripe; o provedor decide o tratamento. */
  email?: string
  /** Nome de exibição do customer. */
  name: string
  /** Metadata livre — útil para correlacionar com tenant_id da plataforma. */
  metadata?: Record<string, string>
}

export interface BillingCustomer {
  /** ID do customer no provedor (ex: cus_XYZ no Stripe). */
  id: string
}

export interface CreateCheckoutSessionInput {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  /** Metadata da sessão (não da subscription). */
  metadata?: Record<string, string>
  /** Metadata propagada para a subscription gerada pelo checkout. */
  subscriptionMetadata?: Record<string, string>
  /** Ex: 'pt-BR'. Adapter valida contra seu conjunto suportado. */
  locale?: string
  allowPromotionCodes?: boolean
  /** Texto customizado exibido junto ao botão de submit no checkout. */
  submitMessage?: string
}

export interface BillingCheckoutSession {
  id: string
  /** URL para redirecionamento do cliente. Pode ser null em edge cases. */
  url: string | null
}

export interface BillingProvider {
  createCustomer(input: CreateCustomerInput): Promise<BillingCustomer>
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingCheckoutSession>
}
