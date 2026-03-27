import { FinanceiroView } from '@/components/financeiro/FinanceiroView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financeiro — NexoPro',
}

export default function FinanceiroPage() {
  return <FinanceiroView />
}
