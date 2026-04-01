'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document, DocumentStatus, Client } from '@/types/database'

export interface DocumentFormData {
  title: string
  type: string
  content: string | null
  file_url: string | null
  status: DocumentStatus
  client_id: string | null
  expires_at: string | null
}

interface UseDocumentsReturn {
  documents: Document[]
  clients: Client[]
  loading: boolean
  error: string | null
  createDocument: (data: DocumentFormData) => Promise<Document | null>
  updateDocument: (id: string, data: Partial<DocumentFormData>) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  markAsSigned: (id: string) => Promise<boolean>
}

export function useDocuments(): UseDocumentsReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [{ data: profile }, { data: docsData }, { data: clientsData }] = await Promise.all([
        supabase.from('profiles').select('tenant_id').eq('id', user.id).single(),
        supabase
          .from('documents')
          .select('*, client:clients(id, full_name)')
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, full_name').eq('is_active', true).order('full_name'),
      ])

      setTenantId(profile?.tenant_id ?? null)
      setDocuments(docsData ?? [])
      setClients((clientsData as Client[]) ?? [])
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createDocument = useCallback(async (data: DocumentFormData): Promise<Document | null> => {
    if (!tenantId) {
      setError('Tenant não identificado. Faça login novamente.')
      return null
    }
    const { data: created, error: createError } = await supabase
      .from('documents')
      .insert({ ...data, tenant_id: tenantId })
      .select('*, client:clients(id, full_name)')
      .single()

    if (createError) { setError(createError.message); return null }
    setDocuments(prev => [created, ...prev])
    return created
  }, [supabase, tenantId])

  const updateDocument = useCallback(async (id: string, data: Partial<DocumentFormData>): Promise<boolean> => {
    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .select('*, client:clients(id, full_name)')
      .single()

    if (updateError) { setError(updateError.message); return false }
    setDocuments(prev => prev.map(d => (d.id === id ? updated : d)))
    return true
  }, [supabase])

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase.from('documents').delete().eq('id', id)
    if (deleteError) { setError(deleteError.message); return false }
    setDocuments(prev => prev.filter(d => d.id !== id))
    return true
  }, [supabase])

  const markAsSigned = useCallback(async (id: string): Promise<boolean> => {
    return updateDocument(id, { status: 'assinado', signed_at: new Date().toISOString() } as Partial<DocumentFormData> & { signed_at: string })
  }, [updateDocument])

  return { documents, clients, loading, error, createDocument, updateDocument, deleteDocument, markAsSigned }
}
