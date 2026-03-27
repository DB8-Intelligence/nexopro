'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ContentProject, ContentProjectStatus } from '@/types/database'

interface UseContentAIReturn {
  projects: ContentProject[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  createProject: (data: { nicho: string; source_url?: string; source_description?: string }) => Promise<ContentProject | null>
  analyze: (projectId: string) => Promise<boolean>
  generatePackage: (projectId: string) => Promise<boolean>
  generateImages: (projectId: string) => Promise<boolean>
  generateVoice: (projectId: string, text: string, voiceId?: string) => Promise<boolean>
  updateProject: (id: string, data: Partial<ContentProject>) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  setProjectStatus: (id: string, status: ContentProjectStatus) => Promise<void>
}

export function useContentAI(): UseContentAIReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [projects, setProjects] = useState<ContentProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()
      setTenantId(profile?.tenant_id ?? null)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('content_projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) setError(fetchError.message)
    else setProjects((data ?? []) as ContentProject[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProjects()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createProject = useCallback(async (data: {
    nicho: string
    source_url?: string
    source_description?: string
  }): Promise<ContentProject | null> => {
    if (!tenantId) { setError('Tenant não identificado.'); return null }

    const { data: created, error: createError } = await supabase
      .from('content_projects')
      .insert({
        tenant_id: tenantId,
        nicho: data.nicho,
        source_url: data.source_url ?? null,
        source_description: data.source_description ?? null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (createError) { setError(createError.message); return null }
    const project = created as ContentProject
    setProjects(prev => [project, ...prev])
    return project
  }, [supabase, tenantId])

  const analyze = useCallback(async (projectId: string): Promise<boolean> => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return false

    setProjectStatus(projectId, 'analyzing')

    try {
      const res = await fetch('/api/content-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          source_url: project.source_url,
          source_description: project.source_description,
          nicho: project.nicho,
        }),
      })
      const result = await res.json() as { analysis?: unknown; error?: string }
      if (!res.ok) { setError(result.error ?? 'Erro na análise'); return false }

      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status: 'configuring', analysis: result.analysis as ContentProject['analysis'] } : p
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  const generatePackage = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/content-ai/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const result = await res.json() as {
        caption?: string; post_text?: string; hashtags?: string[]; ctas?: ContentProject['generated_ctas']; error?: string
      }
      if (!res.ok) { setError(result.error ?? 'Erro ao gerar pacote'); return false }

      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              generated_caption: result.caption ?? null,
              generated_post_text: result.post_text ?? null,
              generated_hashtags: result.hashtags ?? [],
              generated_ctas: result.ctas ?? null,
            }
          : p
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  }, [])

  const generateImages = useCallback(async (projectId: string): Promise<boolean> => {
    setProjectStatus(projectId, 'generating_images')
    try {
      const res = await fetch('/api/content-ai/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const result = await res.json() as { images?: ContentProject['generated_images']; error?: string }
      if (!res.ok) { setError(result.error ?? 'Erro ao gerar imagens'); return false }

      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, status: 'configuring', generated_images: result.images ?? null }
          : p
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateVoice = useCallback(async (projectId: string, text: string, voiceId?: string): Promise<boolean> => {
    setProjectStatus(projectId, 'generating_voice')
    try {
      const res = await fetch('/api/content-ai/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, text, voice_id: voiceId }),
      })
      const result = await res.json() as { voice_url?: string; error?: string }
      if (!res.ok) { setError(result.error ?? 'Erro ao gerar voz'); return false }

      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, status: 'configuring', generated_voice_url: result.voice_url ?? null }
          : p
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateProject = useCallback(async (id: string, data: Partial<ContentProject>): Promise<boolean> => {
    const { data: updated, error: updateError } = await supabase
      .from('content_projects')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) { setError(updateError.message); return false }
    setProjects(prev => prev.map(p => (p.id === id ? updated as ContentProject : p)))
    return true
  }, [supabase])

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase.from('content_projects').delete().eq('id', id)
    if (deleteError) { setError(deleteError.message); return false }
    setProjects(prev => prev.filter(p => p.id !== id))
    return true
  }, [supabase])

  async function setProjectStatus(id: string, status: ContentProjectStatus) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, status } : p)))
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    analyze,
    generatePackage,
    generateImages,
    generateVoice,
    updateProject,
    deleteProject,
    setProjectStatus,
  }
}
