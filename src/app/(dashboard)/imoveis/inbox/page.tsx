import type { Metadata } from 'next'
import { ImoveisInboxView } from '@/components/imoveis/ImoveisInboxView'

export const metadata: Metadata = {
  title: 'Imóveis | NexoOmnix',
  description: 'Gerencie seus imóveis e conteúdo gerado por IA',
}

export default function ImoveisInboxPage() {
  return <ImoveisInboxView />
}
