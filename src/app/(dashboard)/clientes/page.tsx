import { ClientsView } from '@/components/clientes/ClientsView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes — NexoOmnix',
}

export default function ClientesPage() {
  return <ClientsView />
}
