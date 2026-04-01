'use client'

import { useState } from 'react'
import { Loader2, ImagePlus, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentProject } from '@/types/database'

interface ImageGalleryProps {
  project: ContentProject
  onGenerateImages: () => Promise<boolean>
  onContinue: () => void
  onBack: () => void
  loading?: boolean
}

export function ImageGallery({ project, onGenerateImages, onContinue, onBack, loading = false }: ImageGalleryProps) {
  const [generating, setGenerating] = useState(false)
  const images = project.generated_images ?? []
  const isGenerating = project.status === 'generating_images' || generating

  async function handleGenerate() {
    setGenerating(true)
    await onGenerateImages()
    setGenerating(false)
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Imagens geradas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Imagens criadas pela IA para cada cena do roteiro.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> {images.length > 0 ? 'Regerar' : 'Gerar imagens'}</>
          )}
        </button>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm">Gerando imagens com Fal.ai...</p>
          <p className="text-xs text-gray-300">Isso pode levar alguns segundos por cena.</p>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-100 aspect-video relative">
              <img src={img.url} alt={`Cena ${img.scene_id}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
                Cena {img.scene_id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center h-48 gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
            !process.env.NEXT_PUBLIC_FAL_ENABLED
              ? 'border-gray-200 text-gray-300'
              : 'border-gray-200 hover:border-blue-300 text-gray-400'
          )}
          onClick={!isGenerating ? handleGenerate : undefined}
        >
          <ImagePlus className="w-8 h-8" />
          <p className="text-sm">Clique em &ldquo;Gerar imagens&rdquo; para criar as cenas</p>
        </div>
      )}

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
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
