'use client'

import { useAuth } from '@/hooks/useAuth'
import { RedesSociaisView } from '@/components/social/RedesSociaisView'
import { Share2 } from 'lucide-react'

export default function RedesSociaisPage() {
  const { isPlanAtLeast } = useAuth()
  const isPro = isPlanAtLeast('pro')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Redes Sociais IA</h1>
          <p className="text-sm text-gray-500">Crie conteúdo e gerencie seu calendário editorial</p>
        </div>
      </div>
      <RedesSociaisView isPro={isPro} />
    </div>
  )
}
