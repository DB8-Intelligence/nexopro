'use client'

import { useState } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanType } from '@/types/database'

interface PricingPlan {
  id: PlanType
  name: string
  price: string
  description: string
  features: string[]
  badge?: string
  highlighted?: boolean
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 99',
    description: 'Para quem está começando',
    features: [
      'Até 100 clientes',
      'Agenda básica',
      'Financeiro simples',
      'Site público',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 199',
    description: 'Para negócios em crescimento',
    badge: 'Popular',
    highlighted: true,
    features: [
      'Clientes ilimitados',
      'Financeiro completo',
      'Site público personalizado',
      '10 conteúdos IA/mês',
      'Redes sociais IA',
      'Suporte prioritário',
    ],
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: 'R$ 349',
    description: 'Automação e IA completa',
    features: [
      'Tudo do Pro',
      'ContentAI ilimitado',
      'Talking Objects',
      'NFS-e automática',
      'DAS/ISS automático',
      'DRE completo',
      'Agente IA 24h',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 699',
    description: 'Para equipes e franquias',
    features: [
      'Tudo do Pro Plus',
      'Até 10 usuários',
      'API de integração',
      'Gerente dedicado',
      'Onboarding guiado',
      'SLA garantido',
    ],
  },
]

interface PricingTableProps {
  currentPlan: PlanType
  onSelectPlan: (plan: PlanType) => Promise<void>
}

export function PricingTable({ currentPlan, onSelectPlan }: PricingTableProps) {
  const [loading, setLoading] = useState<PlanType | null>(null)

  async function handleSelect(plan: PlanType) {
    if (plan === currentPlan) return
    setLoading(plan)
    await onSelectPlan(plan)
    setLoading(null)
  }

  const planOrder: PlanType[] = ['trial', 'starter', 'pro', 'pro_plus', 'enterprise']
  const currentIndex = planOrder.indexOf(currentPlan)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PLANS.map(plan => {
        const planIndex = planOrder.indexOf(plan.id)
        const isCurrent = plan.id === currentPlan
        const isDowngrade = planIndex < currentIndex
        const isLoading = loading === plan.id

        return (
          <div
            key={plan.id}
            className={cn(
              'card relative flex flex-col',
              plan.highlighted && 'ring-2 ring-blue-500',
              isCurrent && 'ring-2 ring-green-400'
            )}
          >
            {plan.badge && !isCurrent && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            {isCurrent && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-500 text-white text-[11px] font-semibold whitespace-nowrap">
                Plano atual
              </span>
            )}

            <div className="mb-4">
              <p className="text-sm font-bold text-gray-900">{plan.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {plan.price}
                <span className="text-sm font-normal text-gray-400">/mês</span>
              </p>
            </div>

            <ul className="space-y-2 flex-1 mb-4">
              {plan.features.map(feat => (
                <li key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect(plan.id)}
              disabled={isCurrent || isLoading}
              className={cn(
                'w-full py-2 rounded-xl text-sm font-medium transition-colors',
                isCurrent
                  ? 'bg-green-50 text-green-700 cursor-default'
                  : isDowngrade
                    ? 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    : plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800',
                isLoading && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Aguarde...
                </span>
              ) : isCurrent ? (
                'Plano ativo'
              ) : isDowngrade ? (
                'Fazer downgrade'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Assinar {plan.name}
                </span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
