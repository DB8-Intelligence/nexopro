'use client'

import { useAuth } from '@/hooks/useAuth'
import { AgenteContador } from '@/components/ai/AgenteContador'
import { Bot } from 'lucide-react'

export default function IAContadorPage() {
  const { isPlanAtLeast } = useAuth()
  const isPlanAllowed = isPlanAtLeast('pro_plus')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IA Contador</h1>
            <p className="text-sm text-gray-500">Seu contador pessoal 24h — powered by Claude</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <AgenteContador isPlanAllowed={isPlanAllowed} />
      </div>
    </div>
  )
}
