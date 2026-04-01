'use client'

import { useRouter } from 'next/navigation'
import { useProperties } from '@/hooks/useProperties'
import { Copy, Check, Video, MapPin, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Property } from '@/types/database'

function PostCard({ property }: { property: Property }) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleCopy() {
    const text = [property.generated_caption, property.generated_post_text]
      .filter(Boolean)
      .join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      {property.cover_url && (
        <div className="h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
          <img src={property.cover_url} alt={property.title ?? 'Imóvel'} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-sm font-semibold text-gray-800 truncate">{property.title ?? 'Sem título'}</p>

      {(property.city ?? property.neighborhood) && (
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {[property.neighborhood, property.city].filter(Boolean).join(', ')}
        </p>
      )}

      {property.generated_caption && (
        <p className="text-xs text-gray-600 line-clamp-4 whitespace-pre-wrap mb-3">
          {property.generated_caption}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado!' : 'Copiar legenda'}
        </button>
        <button
          onClick={() => router.push(`/imoveis/editor/${property.id}`)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Sparkles className="w-3 h-3" />
          Editar
        </button>
      </div>

      {property.generated_video_url && (
        <a
          href={property.generated_video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-xs text-green-600 hover:underline"
        >
          <Video className="w-3 h-3" /> Ver vídeo
        </a>
      )}
    </div>
  )
}

export default function PostsPage() {
  const { properties, loading } = useProperties()

  const readyProperties = properties.filter(
    p => p.status === 'caption_ready' || p.status === 'ready' || p.status === 'published'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Posts Prontos</h1>
        <p className="text-sm text-gray-500">
          {readyProperties.length} imóvel(eis) com conteúdo gerado pronto para publicar.
        </p>
      </div>

      {readyProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <Sparkles className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum conteúdo pronto ainda.</p>
          <p className="text-xs text-gray-400">Cadastre um imóvel e gere a legenda pela IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {readyProperties.map(p => (
            <PostCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
