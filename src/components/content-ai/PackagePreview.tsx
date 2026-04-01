'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw, Loader2, Hash, ArrowLeft } from 'lucide-react'
import type { ContentProject } from '@/types/database'

interface PackagePreviewProps {
  project: ContentProject
  onGeneratePackage: () => Promise<boolean>
  onBack: () => void
  onFinish: () => void
  loading?: boolean
}

export function PackagePreview({ project, onGeneratePackage, onBack, onFinish, loading = false }: PackagePreviewProps) {
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    await onGeneratePackage()
    setGenerating(false)
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasContent = !!project.generated_caption

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pacote de conteúdo</h2>
          <p className="text-sm text-gray-500 mt-0.5">Legenda, post e hashtags prontos para publicar.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> {hasContent ? 'Regerar' : 'Gerar textos'}</>
          )}
        </button>
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
          <p className="text-sm">Clique em &ldquo;Gerar textos&rdquo; para criar o pacote completo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Post text */}
          {project.generated_post_text && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Texto do post</p>
                <button
                  onClick={() => handleCopy(project.generated_post_text!, 'post')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {copied === 'post' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'post' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-sm text-gray-800 font-medium">{project.generated_post_text}</p>
            </div>
          )}

          {/* Caption */}
          {project.generated_caption && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Legenda completa</p>
                <button
                  onClick={() => handleCopy(project.generated_caption!, 'caption')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {copied === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'caption' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-6">
                {project.generated_caption}
              </p>
            </div>
          )}

          {/* Hashtags */}
          {project.generated_hashtags && project.generated_hashtags.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hashtags</p>
                </div>
                <button
                  onClick={() => handleCopy(project.generated_hashtags.join(' '), 'hashtags')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {copied === 'hashtags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'hashtags' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.generated_hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          {project.generated_ctas && project.generated_ctas.length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">CTAs</p>
              <div className="space-y-1.5">
                {project.generated_ctas.map((cta, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs capitalize">
                      {cta.type}
                    </span>
                    <span className="text-gray-700">{cta.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          onClick={onFinish}
          disabled={!hasContent || loading}
          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40"
        >
          Finalizar projeto
        </button>
      </div>
    </div>
  )
}
