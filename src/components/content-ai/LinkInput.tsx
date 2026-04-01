'use client'

import { useState } from 'react'
import { Link, FileText, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NICHO_OPTIONS = [
  { value: 'imoveis', label: 'Imóveis' },
  { value: 'beleza', label: 'Beleza & Estética' },
  { value: 'saude', label: 'Saúde & Clínica' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'tecnico', label: 'Serviços Técnicos' },
  { value: 'pet', label: 'Pet & Veterinário' },
  { value: 'educacao', label: 'Educação' },
  { value: 'nutricao', label: 'Nutrição & Fitness' },
  { value: 'engenharia', label: 'Engenharia & Arquitetura' },
  { value: 'fotografia', label: 'Fotografia & Vídeo' },
]

interface LinkInputProps {
  onSubmit: (data: { nicho: string; source_url?: string; source_description?: string }) => Promise<void>
  loading?: boolean
}

export function LinkInput({ onSubmit, loading = false }: LinkInputProps) {
  const [mode, setMode] = useState<'url' | 'text'>('text')
  const [nicho, setNicho] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceDescription, setSourceDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nicho) return
    await onSubmit({
      nicho,
      source_url: mode === 'url' ? sourceUrl || undefined : undefined,
      source_description: sourceDescription || undefined,
    })
  }

  const isValid = nicho && (mode === 'url' ? sourceUrl.trim() : sourceDescription.trim())

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Criar conteúdo com IA</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Informe sobre o que é o conteúdo e a IA cria legenda, imagens e roteiro.
        </p>
      </div>

      {/* Nicho */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Nicho do negócio</label>
        <div className="grid grid-cols-2 gap-2">
          {NICHO_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setNicho(opt.value)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm border transition-colors text-left',
                nicho === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source mode toggle */}
      <div>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors',
              mode === 'text' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Descrever
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors',
              mode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <Link className="w-3.5 h-3.5" />
            Colar URL
          </button>
        </div>

        {mode === 'url' ? (
          <div className="space-y-2">
            <input
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <textarea
              rows={2}
              value={sourceDescription}
              onChange={e => setSourceDescription(e.target.value)}
              placeholder="Contexto adicional (opcional)..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
            />
          </div>
        ) : (
          <textarea
            rows={4}
            value={sourceDescription}
            onChange={e => setSourceDescription(e.target.value)}
            placeholder="Descreva o conteúdo que você quer criar. Ex: Apartamento 2 quartos à venda em Florianópolis, R$ 480.000, próximo ao mar, com churrasqueira e 2 vagas..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        {loading ? 'Analisando...' : (
          <><ArrowRight className="w-4 h-4" /> Analisar com IA</>
        )}
      </button>
    </form>
  )
}
