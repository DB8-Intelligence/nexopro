'use client'

import { CheckCircle2, Copy, Check, Plus, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { ContentProject } from '@/types/database'

interface DeliveryScreenProps {
  project: ContentProject
  onNewProject: () => void
}

export function DeliveryScreen({ project, onNewProject }: DeliveryScreenProps) {
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const fullCaption = [
    project.generated_caption,
    project.generated_hashtags?.length ? '\n\n' + project.generated_hashtags.join(' ') : '',
  ].filter(Boolean).join('')

  return (
    <div className="space-y-6 max-w-xl">
      {/* Success header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Conteúdo pronto!</p>
          <p className="text-xs text-green-600 mt-0.5">
            {project.title ?? 'Seu projeto'} foi gerado com sucesso.
          </p>
        </div>
      </div>

      {/* Images preview */}
      {project.generated_images && project.generated_images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Imagens ({project.generated_images.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {project.generated_images.map((img, i) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative group">
                <img src={img.url} alt={`Cena ${img.scene_id}`} className="w-full h-full object-cover" />
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy all */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Legenda completa + hashtags</p>
          <button
            onClick={() => handleCopy(fullCaption, 'all')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            {copied === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied === 'all' ? 'Copiado!' : 'Copiar tudo'}
          </button>
        </div>
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-auto">
          {fullCaption || project.generated_post_text}
        </p>
      </div>

      {/* Voice */}
      {project.generated_voice_url && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Narração</p>
          <audio src={project.generated_voice_url} controls className="w-full" />
        </div>
      )}

      <button
        onClick={onNewProject}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Criar novo conteúdo
      </button>
    </div>
  )
}
