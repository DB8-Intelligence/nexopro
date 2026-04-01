'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/database'

export interface ClientFormData {
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  cpf: string | null
  birth_date: string | null
  gender: string | null
  address_street: string | null
  address_number: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  tags: string[]
  notes: string | null
  source: string | null
  is_active: boolean
}

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  fetchClients: () => Promise<void>
  createClient_: (data: ClientFormData) => Promise<Client | null>
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<boolean>
  deleteClient: (id: string) => Promise<boolean>
}

export function useClients(): UseClientsReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
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

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .order('full_name')
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setClients(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchClients()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createClient_ = useCallback(async (data: ClientFormData): Promise<Client | null> => {
    if (!tenantId) {
      setError('Tenant não identificado. Faça login novamente.')
      return null
    }
    const { data: created, error: createError } = await supabase
      .from('clients')
      .insert({ ...data, tenant_id: tenantId })
      .select('*')
      .single()
    if (createError) {
      setError(createError.message)
      return null
    }
    setClients(prev =>
      [...prev, created].sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'))
    )
    return created
  }, [supabase, tenantId])

  const updateClient = useCallback(async (id: string, data: Partial<ClientFormData>): Promise<boolean> => {
    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) {
      setError(updateError.message)
      return false
    }
    setClients(prev => prev.map(c => (c.id === id ? updated : c)))
    return true
  }, [supabase])

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return false
    }
    setClients(prev => prev.filter(c => c.id !== id))
    return true
  }, [supabase])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient_,
    updateClient,
    deleteClient,
  }
}
