'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, AppointmentStatus, Client, Service } from '@/types/database'

export interface AppointmentFormData {
  client_id: string | null
  service_id: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  price: number | null
  discount: number
  payment_method: string | null
  notes: string | null
  internal_notes: string | null
}

interface UseAppointmentsReturn {
  appointments: Appointment[]
  clients: Client[]
  services: Service[]
  loading: boolean
  error: string | null
  fetchByWeek: (weekStart: Date) => Promise<void>
  createAppointment: (data: AppointmentFormData) => Promise<Appointment | null>
  updateAppointment: (id: string, data: Partial<AppointmentFormData>) => Promise<boolean>
  deleteAppointment: (id: string) => Promise<boolean>
}

export function useAppointments(): UseAppointmentsReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega tenant_id, clientes e serviços na montagem
  useEffect(() => {
    async function loadLookups() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: clientsData }, { data: servicesData }] =
        await Promise.all([
          supabase.from('profiles').select('tenant_id').eq('id', user.id).single(),
          supabase.from('clients').select('*').eq('is_active', true).order('full_name'),
          supabase.from('services').select('*').eq('is_active', true).order('name'),
        ])

      setTenantId(profile?.tenant_id ?? null)
      setClients(clientsData ?? [])
      setServices(servicesData ?? [])
    }
    loadLookups()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchByWeek = useCallback(async (weekStart: Date) => {
    setLoading(true)
    setError(null)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, full_name, phone),
        service:services(id, name, color, duration_min, price),
        professional:profiles(id, full_name)
      `)
      .gte('starts_at', weekStart.toISOString())
      .lt('starts_at', weekEnd.toISOString())
      .order('starts_at')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setAppointments(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  const createAppointment = useCallback(async (data: AppointmentFormData): Promise<Appointment | null> => {
    if (!tenantId) {
      setError('Tenant não identificado. Faça login novamente.')
      return null
    }
    const total = (data.price ?? 0) - (data.discount ?? 0)

    const { data: created, error: createError } = await supabase
      .from('appointments')
      .insert({ ...data, total, tenant_id: tenantId })
      .select(`
        *,
        client:clients(id, full_name, phone),
        service:services(id, name, color, duration_min, price),
        professional:profiles(id, full_name)
      `)
      .single()

    if (createError) {
      setError(createError.message)
      return null
    }

    setAppointments(prev =>
      [...prev, created].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      )
    )
    return created
  }, [supabase, tenantId])

  const updateAppointment = useCallback(async (
    id: string,
    data: Partial<AppointmentFormData>
  ): Promise<boolean> => {
    const extra: { total?: number } = {}

    if (data.price !== undefined || data.discount !== undefined) {
      const current = appointments.find(a => a.id === id)
      const price = data.price ?? current?.price ?? 0
      const discount = data.discount ?? current?.discount ?? 0
      extra.total = price - discount
    }

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({ ...data, ...extra })
      .eq('id', id)
      .select(`
        *,
        client:clients(id, full_name, phone),
        service:services(id, name, color, duration_min, price),
        professional:profiles(id, full_name)
      `)
      .single()

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setAppointments(prev => prev.map(a => (a.id === id ? updated : a)))
    return true
  }, [supabase, appointments])

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setAppointments(prev => prev.filter(a => a.id !== id))
    return true
  }, [supabase])

  return {
    appointments,
    clients,
    services,
    loading,
    error,
    fetchByWeek,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  }
}
