export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.tenants) redirect('/login')

  const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants

  return (
    <DashboardShell tenant={tenant} profile={profile}>
      {children}
    </DashboardShell>
  )
}
