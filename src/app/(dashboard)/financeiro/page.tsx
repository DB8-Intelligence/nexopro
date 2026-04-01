import { FinanceiroView } from '@/components/financeiro/FinanceiroView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financeiro — NexoOmnix',
}

export default function FinanceiroPage() {
  return <FinanceiroView />
}
