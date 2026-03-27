'use client'

import { ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const FORMAT_OPTIONS = [
  { value: 'reel', label: 'Reel / TikTok', desc: 'Vídeo vertical 9:16, 15-60s' },
  { value: 'post', label: 'Post Feed', desc: 'Imagem quadrada ou paisagem' },
  { value: 'carrossel', label: 'Carrossel', desc: '3-10 slides com texto' },
  { value: 'stories', label: 'Stories', desc: 'Vertical 9:16, 15s por tela' },
]

interface NichoConfigProps {
  formato: string
  onFormatoChange: (formato: string) => void
  onContinue: () => void
  onBack: () => void
  loading?: boolean
}

export function NichoConfig({ formato, onFormatoChange, onContinue, onBack, loading = false }: NichoConfigProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Formato do conteúdo</h2>
        <p className="text-sm text-gray-500 mt-0.5">Escolha o formato para este conteúdo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FORMAT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFormatoChange(opt.value)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-colors',
              formato === opt.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            <p className={cn(
              'text-sm font-semibold',
              formato === opt.value ? 'text-blue-700' : 'text-gray-800'
            )}>
              {opt.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
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
          onClick={onContinue}
          disabled={!formato || loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
