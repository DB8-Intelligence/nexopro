'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DeliveryScreen } from '@/components/content-ai/DeliveryScreen'
import { useContentAI } from '@/hooks/useContentAI'
import type { ContentProject } from '@/types/database'

export default function ConteudoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { projects, loading } = useContentAI()
  const [project, setProject] = useState<ContentProject | null>(null)

  useEffect(() => {
    if (!loading && id) {
      const found = projects.find(p => p.id === id) ?? null
      setProject(found)
    }
  }, [projects, loading, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-gray-500">Projeto não encontrado.</p>
        <button
          onClick={() => router.push('/conteudo')}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>
    )
  }

  return (
    <DeliveryScreen
      project={project}
      onNewProject={() => router.push('/conteudo')}
    />
  )
}
