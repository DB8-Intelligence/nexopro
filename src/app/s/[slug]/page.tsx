import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NicheLandingPage } from '@/components/site/NicheLandingPage'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, niche')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!tenant) return { title: 'Página não encontrada' }

  return {
    title: tenant.name,
    description: `Agende agora com ${tenant.name}`,
    robots: { index: true, follow: true },
  }
}

export default async function ClientSitePage({ params }: Props) {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!tenant) notFound()

  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('site_enabled', true)
    .single()

  if (!settings) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('price', { ascending: true })
    .limit(12)

  return (
    <NicheLandingPage
      tenant={tenant}
      settings={settings}
      services={services ?? []}
    />
  )
}
