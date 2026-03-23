'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tenant, TenantSettings, TenantModule } from '@/types/database'

interface TenantState {
  tenant: Tenant | null
  settings: TenantSettings | null
  modules: TenantModule[]
  loading: boolean
  error: string | null
}

export function useTenant(tenantId?: string) {
  const supabase = createClient()
  const [state, setState] = useState<TenantState>({
    tenant: null,
    settings: null,
    modules: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!tenantId) return

    async function load() {
      setState(s => ({ ...s, loading: true }))

      const [tenantRes, settingsRes, modulesRes] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', tenantId).single(),
        supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId).single(),
        supabase.from('tenant_modules').select('*').eq('tenant_id', tenantId).eq('is_enabled', true),
      ])

      setState({
        tenant: tenantRes.data,
        settings: settingsRes.data,
        modules: modulesRes.data ?? [],
        loading: false,
        error: tenantRes.error?.message ?? null,
      })
    }

    load()
  }, [tenantId, supabase])

  function hasModule(moduleId: string): boolean {
    return state.modules.some(m => m.module_id === moduleId && m.is_enabled)
  }

  async function updateSettings(updates: Partial<TenantSettings>) {
    if (!state.settings) return

    const { error } = await supabase
      .from('tenant_settings')
      .update(updates)
      .eq('id', state.settings.id)

    if (!error) {
      setState(s => ({
        ...s,
        settings: s.settings ? { ...s.settings, ...updates } : null,
      }))
    }

    return error
  }

  return { ...state, hasModule, updateSettings }
}
