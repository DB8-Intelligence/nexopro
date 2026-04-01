import type { Metadata } from 'next'
import { SiteEditor } from '@/components/site/SiteEditor'

export const metadata: Metadata = {
  title: 'Site Público',
}

export default function SitePublicoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Público</h1>
        <p className="text-sm text-gray-500 mt-1">Configure seu site de agendamento visível para clientes</p>
      </div>
      <SiteEditor />
    </div>
  )
}
