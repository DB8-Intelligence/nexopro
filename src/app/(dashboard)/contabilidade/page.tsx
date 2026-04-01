import type { Metadata } from 'next'
import { ContabilidadeView } from '@/components/contabilidade/ContabilidadeView'

export const metadata: Metadata = {
  title: 'Contabilidade',
}

export default function ContabilidadePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contabilidade</h1>
        <p className="text-sm text-gray-500 mt-1">DRE automático, NFS-e e obrigações fiscais</p>
      </div>
      <ContabilidadeView />
    </div>
  )
}
