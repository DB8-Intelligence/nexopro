'use client'

import { useState } from 'react'
import { Video, Loader2, ExternalLink, CheckCircle2, Play } from 'lucide-react'
import type { Property, PropertyStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface VideoGeneratorProps {
  property: Property
  onGenerateVideo: (propertyId: string, formData: FormData) => Promise<boolean>
}

export function VideoGenerator({ property, onGenerateVideo }: VideoGeneratorProps) {
  const [selectedImages, setSelectedImages] = useState<number[]>([])
  const [generating, setGenerating] = useState(false)

  const allImages = [
    ...(property.cover_url ? [property.cover_url] : []),
    ...(property.images ?? []),
  ]

  function toggleImage(index: number) {
    setSelectedImages(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  async function handleGenerate() {
    const imagesToUse = selectedImages.length > 0
      ? selectedImages.map(i => allImages[i])
      : allImages

    if (imagesToUse.length === 0) return

    const fd = new FormData()
    imagesToUse.forEach((url, i) => fd.append(`image_url_${i}`, url))
    fd.append('image_count', String(imagesToUse.length))

    setGenerating(true)
    await onGenerateVideo(property.id, fd)
    setGenerating(false)
  }

  const isProcessing = property.status === 'video_processing'
  const hasVideo = !!property.generated_video_url
  const canGenerate = !isProcessing && !generating && allImages.length > 0

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-blue-500" />
          Vídeo IA
        </p>
        {hasVideo && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
          </span>
        )}
        {isProcessing && (
          <span className="flex items-center gap-1 text-xs text-orange-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...
          </span>
        )}
      </div>

      {hasVideo ? (
        <div className="space-y-2">
          <video
            src={property.generated_video_url!}
            controls
            className="w-full rounded-lg bg-black"
            style={{ maxHeight: 180 }}
          />
          <div className="flex gap-2">
            <a
              href={property.generated_video_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink className="w-3 h-3" />
              Abrir
            </a>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <Play className="w-3 h-3" />
              Regerar
            </button>
          </div>
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center py-5 gap-2 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
          <p className="text-xs">Gerando seu vídeo...</p>
          <p className="text-[10px] text-gray-300 text-center">
            Isso pode levar alguns minutos. <br />
            Você será notificado quando estiver pronto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allImages.length > 0 && (
            <>
              <p className="text-[10px] text-gray-500">
                Selecione as fotos para o vídeo (vazio = todas):
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleImage(i)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImages.includes(i)
                        ? 'border-blue-500'
                        : 'border-transparent'
                    )}
                  >
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedImages.includes(i) && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {i === 0 && property.cover_url && (
                      <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/50 text-white text-center py-0.5">
                        Capa
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando...</>
            ) : (
              <><Video className="w-4 h-4" /> Gerar Vídeo</>
            )}
          </button>

          {allImages.length === 0 && (
            <p className="text-xs text-gray-400 text-center">
              Adicione fotos ao imóvel para gerar o vídeo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
