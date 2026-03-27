'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PropertyEditor } from './PropertyEditor'
import { useProperties } from '@/hooks/useProperties'
import type { Property } from '@/types/database'

export function ImoveisEditorView() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { properties, loading, fetchProperties, updateProperty, deleteProperty, generateCaption, generateVideo } = useProperties()
  const [property, setProperty] = useState<Property | null>(null)

  useEffect(() => {
    fetchProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loading && id) {
      const found = properties.find(p => p.id === id) ?? null
      setProperty(found)
    }
  }, [properties, loading, id])

  // Sync property when properties list updates (e.g., after caption generation)
  useEffect(() => {
    if (id) {
      const updated = properties.find(p => p.id === id)
      if (updated) setProperty(updated)
    }
  }, [properties, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-gray-500">Imóvel não encontrado.</p>
        <button
          onClick={() => router.push('/imoveis/inbox')}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </button>
      </div>
    )
  }

  return (
    <PropertyEditor
      property={property}
      onUpdate={updateProperty}
      onDelete={deleteProperty}
      onGenerateCaption={generateCaption}
      onGenerateVideo={generateVideo}
    />
  )
}
