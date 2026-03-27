'use client'

import { ArrowRight, ArrowLeft, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TalkingObject } from '@/lib/content-ai/talking-objects'

interface TalkingObjectSelectorProps {
  nicho: string
  objects: TalkingObject[]
  selected: TalkingObject | null
  onSelect: (obj: TalkingObject | null) => void
  onContinue: () => void
  onBack: () => void
  loading?: boolean
}

export function TalkingObjectSelector({
  objects,
  selected,
  onSelect,
  onContinue,
  onBack,
  loading = false,
}: TalkingObjectSelectorProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Personagem IA</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Escolha um personagem animado para apresentar seu conteúdo (ou pule esta etapa).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {objects.map(obj => (
          <button
            key={obj.id}
            type="button"
            onClick={() => onSelect(selected?.id === obj.id ? null : obj)}
            className={cn(
              'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-colors',
              selected?.id === obj.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <span className="text-3xl flex-shrink-0">{obj.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-semibold',
                selected?.id === obj.id ? 'text-blue-700' : 'text-gray-800'
              )}>
                {obj.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{obj.prompt}</p>
            </div>
            {selected?.id === obj.id && (
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={() => { onSelect(null); onContinue() }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          <SkipForward className="w-4 h-4" />
          Pular
        </button>
        <button
          onClick={onContinue}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
