'use client'

import { useRouter } from 'next/navigation'
import { Lock, Zap } from 'lucide-react'
import type { PlanType } from '@/types/database'

const PLAN_LABELS: Record<PlanType, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  pro_plus: 'Pro Plus',
  enterprise: 'Enterprise',
}

interface UpgradePromptProps {
  feature: string
  requiredPlan: PlanType
  inline?: boolean
}

export function UpgradePrompt({ feature, requiredPlan, inline = false }: UpgradePromptProps) {
  const router = useRouter()

  if (inline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm">
        <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span className="text-amber-800">
          <strong>{feature}</strong> requer o plano <strong>{PLAN_LABELS[requiredPlan]}</strong>.
        </span>
        <button
          onClick={() => router.push('/assinatura')}
          className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 whitespace-nowrap"
        >
          <Zap className="w-3 h-3" /> Upgrade
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
        <Lock className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{feature}</p>
        <p className="text-xs text-gray-500 mt-1">
          Disponível no plano <strong>{PLAN_LABELS[requiredPlan]}</strong> ou superior.
        </p>
      </div>
      <button
        onClick={() => router.push('/assinatura')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        <Zap className="w-4 h-4" />
        Ver planos
      </button>
    </div>
  )
}
