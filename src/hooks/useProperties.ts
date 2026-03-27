'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Property, PropertyStatus } from '@/types/database'

export interface PropertyFormData {
  title: string | null
  description: string | null
  price: string | null
  city: string | null
  neighborhood: string | null
  property_type: string | null
  property_standard: string | null
  investment_value: number | null
  built_area_m2: number | null
  highlights: string | null
  cover_url: string | null
  images: string[]
}

interface UsePropertiesReturn {
  properties: Property[]
  loading: boolean
  error: string | null
  fetchProperties: (statusFilter?: PropertyStatus | 'all') => Promise<void>
  createProperty: (data: PropertyFormData) => Promise<Property | null>
  updateProperty: (id: string, data: Partial<PropertyFormData & { status: PropertyStatus }>) => Promise<boolean>
  deleteProperty: (id: string) => Promise<boolean>
  generateCaption: (propertyId: string) => Promise<boolean>
  generateVideo: (propertyId: string, formData: FormData) => Promise<boolean>
}

export function useProperties(): UsePropertiesReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
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

  const fetchProperties = useCallback(async (statusFilter: PropertyStatus | 'all' = 'all') => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProperties(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createProperty = useCallback(async (data: PropertyFormData): Promise<Property | null> => {
    if (!tenantId) { setError('Tenant não identificado.'); return null }

    const { data: created, error: createError } = await supabase
      .from('properties')
      .insert({ ...data, tenant_id: tenantId, status: 'new' })
      .select('*')
      .single()

    if (createError) { setError(createError.message); return null }
    setProperties(prev => [created, ...prev])
    return created
  }, [supabase, tenantId])

  const updateProperty = useCallback(async (
    id: string,
    data: Partial<PropertyFormData & { status: PropertyStatus }>
  ): Promise<boolean> => {
    const { data: updated, error: updateError } = await supabase
      .from('properties')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) { setError(updateError.message); return false }
    setProperties(prev => prev.map(p => (p.id === id ? updated : p)))
    return true
  }, [supabase])

  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase.from('properties').delete().eq('id', id)
    if (deleteError) { setError(deleteError.message); return false }
    setProperties(prev => prev.filter(p => p.id !== id))
    return true
  }, [supabase])

  const generateCaption = useCallback(async (propertyId: string): Promise<boolean> => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return false

    // Atualiza UI imediatamente
    setProperties(prev => prev.map(p =>
      p.id === propertyId ? { ...p, status: 'processing' as PropertyStatus } : p
    ))

    try {
      const res = await fetch('/api/imoveis/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          title: property.title,
          description: property.description,
          price: property.price,
          city: property.city,
          neighborhood: property.neighborhood,
          highlights: property.highlights,
          property_type: property.property_type,
        }),
      })
      const result = await res.json() as { caption?: string; post_text?: string; error?: string }
      if (!res.ok) { setError(result.error ?? 'Erro ao gerar legenda'); return false }

      setProperties(prev => prev.map(p =>
        p.id === propertyId
          ? { ...p, status: 'caption_ready' as PropertyStatus, generated_caption: result.caption ?? null, generated_post_text: result.post_text ?? null }
          : p
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  }, [properties])

  const generateVideo = useCallback(async (propertyId: string, formData: FormData): Promise<boolean> => {
    formData.append('property_id', propertyId)
    setProperties(prev => prev.map(p =>
      p.id === propertyId ? { ...p, status: 'video_processing' as PropertyStatus } : p
    ))

    try {
      const res = await fetch('/api/imoveis/generate-video', { method: 'POST', body: formData })
      const result = await res.json() as { job_id?: string; error?: string }
      if (!res.ok) { setError(result.error ?? 'Erro ao gerar vídeo'); return false }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede')
      return false
    }
  }, [])

  return {
    properties,
    loading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    generateCaption,
    generateVideo,
  }
}
